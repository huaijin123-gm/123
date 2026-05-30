import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hasSupabaseConfig, supabase } from "../utils/supabaseClient";
import { resizeImageFile } from "../utils/image";

const PHOTO_BUCKET = "museum-photos";
const REACTION_EMOJIS = ["❤️", "🥺", "🫂", "😂"];

export function useSupabaseMuseum(defaultContent) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(hasSupabaseConfig);
  const [authNotice, setAuthNotice] = useState("");
  const [museum, setMuseum] = useState(null);
  const [role, setRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [memories, setMemories] = useState([]);
  const [letters, setLetters] = useState([]);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [syncStatus, setSyncStatus] = useState("连接中");
  const [notice, setNotice] = useState("");
  const [loadingMuseum, setLoadingMuseum] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [uploadState, setUploadState] = useState(null);
  const latestLoadId = useRef(0);

  const userId = session?.user?.id;

  const showNotice = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setAuthLoading(false);
      return undefined;
    }

    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error_code") || params.get("error");
    if (authError) {
      setAuthNotice("旧登录链接已经失效，请改用 6 位验证码进入。");
      window.history.replaceState({}, "", window.location.pathname);
    }

    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        setAuthNotice("登录状态已过期，请重新验证邮箱。");
      }

      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        setSession(nextSession);

        if (event === "TOKEN_REFRESHED") {
          setAuthNotice("");
        }

        if (event === "SIGNED_OUT") {
          setAuthNotice("登录状态已退出，需要重新验证邮箱。");
        }
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOnline() {
      setSyncStatus("正在重新连接");
      loadMuseum();
    }

    function handleOffline() {
      setSyncStatus("网络断开");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  const loadMuseum = useCallback(async () => {
    if (!userId) {
      setMuseum(null);
      setRole(null);
      setMembers([]);
      setMemories([]);
      setLetters([]);
      return;
    }

    const loadId = latestLoadId.current + 1;
    latestLoadId.current = loadId;
    setLoadingMuseum(true);
    setSyncStatus(navigator.onLine ? "正在同步" : "网络断开");

    const { data: memberRows, error: memberError } = await supabase
      .from("museum_members")
      .select("museum_id, role, display_name, museums(id, name, owner_id, created_at)")
      .eq("user_id", userId)
      .limit(1);

    if (latestLoadId.current !== loadId) {
      return;
    }

    if (memberError) {
      setSyncStatus("同步失败");
      setLoadingMuseum(false);
      showNotice("云端数据读取失败，请稍后再试");
      return;
    }

    const membership = memberRows?.[0];
    if (!membership) {
      setMuseum(null);
      setRole(null);
      setMembers([]);
      setMemories([]);
      setLetters([]);
      setLoadingMuseum(false);
      setSyncStatus("等待开馆");
      return;
    }

    const museumId = membership.museum_id;
    setMuseum(membership.museums);
    setRole(membership.role);

    const [
      membersResult,
      memoriesResult,
      commentsResult,
      reactionsResult,
      lettersResult,
    ] = await Promise.all([
      supabase
        .from("museum_members")
        .select("id, museum_id, user_id, role, display_name, joined_at")
        .eq("museum_id", museumId)
        .order("joined_at", { ascending: true }),
      supabase
        .from("memories")
        .select("*, memory_photos(*)")
        .eq("museum_id", museumId)
        .order("memory_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("comments")
        .select("*")
        .eq("museum_id", museumId)
        .order("created_at", { ascending: true }),
      supabase
        .from("reactions")
        .select("*")
        .eq("museum_id", museumId),
      supabase
        .from("letters")
        .select("*")
        .eq("museum_id", museumId)
        .order("created_at", { ascending: false }),
    ]);

    if (latestLoadId.current !== loadId) {
      return;
    }

    const failed = [
      membersResult,
      memoriesResult,
      commentsResult,
      reactionsResult,
      lettersResult,
    ].find((result) => result.error);

    if (failed) {
      setSyncStatus("同步失败");
      setLoadingMuseum(false);
      showNotice("云端同步失败，请点右下角重新同步");
      return;
    }

    const signedPhotoUrls = await createPhotoUrlMap(memoriesResult.data || []);

    setMembers(membersResult.data || []);
    setComments(commentsResult.data || []);
    setReactions(reactionsResult.data || []);
    setLetters((lettersResult.data || []).map(mapLetter));
    setMemories(
      (memoriesResult.data || []).map((memory, index) =>
        mapMemory(memory, signedPhotoUrls, index),
      ),
    );
    setSyncStatus("已同步");
    setLoadingMuseum(false);
  }, [showNotice, userId]);

  useEffect(() => {
    loadMuseum();
  }, [loadMuseum]);

  useEffect(() => {
    if (!museum?.id) {
      return undefined;
    }

    const channel = supabase
      .channel(`museum-${museum.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "memories", filter: `museum_id=eq.${museum.id}` },
        loadMuseum,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "memory_photos", filter: `museum_id=eq.${museum.id}` },
        loadMuseum,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `museum_id=eq.${museum.id}` },
        loadMuseum,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions", filter: `museum_id=eq.${museum.id}` },
        loadMuseum,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "letters", filter: `museum_id=eq.${museum.id}` },
        loadMuseum,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setSyncStatus("实时同步中");
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setSyncStatus(navigator.onLine ? "正在重连" : "网络断开");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMuseum, museum?.id]);

  const detailByMemoryId = useMemo(() => {
    const commentsByMemory = groupBy(comments, "memory_id");
    const reactionsByMemory = groupBy(reactions, "memory_id");

    return Object.fromEntries(
      memories.map((memory) => {
        const memoryComments = commentsByMemory[memory.id] || [];
        const memoryReactions = reactionsByMemory[memory.id] || [];

        return [
          memory.id,
          {
            comments: memoryComments,
            reactions: memoryReactions,
            reactionCounts: REACTION_EMOJIS.map((emoji) => ({
              emoji,
              count: memoryReactions.filter((item) => item.emoji === emoji).length,
              reacted: memoryReactions.some(
                (item) => item.emoji === emoji && item.user_id === userId,
              ),
            })),
          },
        ];
      }),
    );
  }, [comments, memories, reactions, userId]);

  async function requestEmailOtp(email) {
    setAuthNotice("");
    setSyncStatus("正在发送验证码");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setSyncStatus("发送失败");
      throw error;
    }

    setSyncStatus("请查收验证码");
    setAuthNotice("验证码已发送，输入邮件里的 6 位数字。");
  }

  async function verifyEmailOtp(email, token) {
    setSyncStatus("正在验证");
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      setSyncStatus("验证失败");
      setAuthNotice("验证码无效或已过期，请重新获取。");
      throw error;
    }

    setSession(data.session);
    setAuthNotice("");
    setSyncStatus("已登录");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMuseum(null);
    setRole(null);
    setMembers([]);
    setMemories([]);
  }

  async function createMuseum() {
    setSyncStatus("正在开馆");
    const { data, error } = await supabase.rpc("create_museum_with_owner", {
      museum_name: "我们的时间博物馆",
    });

    if (error) {
      setSyncStatus("开馆失败");
      showNotice("开馆失败，请稍后再试");
      throw error;
    }

    await loadMuseum();
    await importDefaultContent(data);
    await loadMuseum();
    showNotice("我们的博物馆已经开馆");
  }

  async function joinMuseum(inviteToken) {
    setSyncStatus("正在加入");
    const { error } = await supabase.rpc("join_museum_invite", {
      invite_token: inviteToken,
    });

    if (error) {
      setSyncStatus("加入失败");
      showNotice("邀请已过期、已使用，或空间已经满员");
      throw error;
    }

    await loadMuseum();
    showNotice("你已经进入我们的博物馆");
  }

  async function createInvite() {
    if (!museum?.id) {
      return;
    }

    setSyncStatus("正在生成邀请");
    const { data, error } = await supabase.rpc("create_museum_invite", {
      target_museum_id: museum.id,
    });

    if (error) {
      setSyncStatus("邀请失败");
      showNotice("邀请生成失败，可能已经有两个人在馆内");
      throw error;
    }

    const link = `${window.location.origin}/?invite=${data}`;
    setInviteLink(link);
    await navigator.clipboard?.writeText(link);
    setSyncStatus("已同步");
    showNotice("邀请链接已复制，可以发给她");
  }

  async function addMemory() {
    if (!museum?.id || !userId) {
      return;
    }

    setSyncStatus("正在保存");
    const { error } = await supabase.from("memories").insert({
      museum_id: museum.id,
      title: "新的回忆",
      memory_date: new Date().toISOString().slice(0, 10),
      description: "点这里写下想收藏的话。",
      memory_type: "日常",
      achievement: "新的小成就",
      author_id: userId,
    });

    if (error) {
      setSyncStatus("保存失败");
      showNotice("新回忆没有保存成功，请重试");
      return;
    }

    setSyncStatus("已同步");
    showNotice("已经收藏一条新回忆");
    await loadMuseum();
  }

  async function updateMemory(memoryId, field, value) {
    const column = {
      date: "memory_date",
      title: "title",
      type: "memory_type",
      message: "description",
      achievement: "achievement",
    }[field];

    if (!column || !museum?.id) {
      return;
    }

    setMemories((items) =>
      items.map((item) =>
        item.id === memoryId ? { ...item, [field]: value } : item,
      ),
    );

    setSyncStatus("正在保存");
    const payload = {
      [column]: column === "memory_date" ? toDbDate(value) : value,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("memories")
      .update(payload)
      .eq("id", memoryId)
      .eq("museum_id", museum.id);

    if (error) {
      setSyncStatus("保存失败");
      showNotice("修改没有保存成功，请重试");
      await loadMuseum();
      return;
    }

    setSyncStatus("已同步");
  }

  async function uploadMemoryImage(memoryId, fileOrFiles) {
    const files = Array.from(fileOrFiles || []).filter(Boolean);
    if (!museum?.id || !userId || files.length === 0) {
      return;
    }

    setUploadState({ memoryId, current: 0, total: files.length, failed: 0 });

    let failed = 0;
    for (const [index, file] of files.entries()) {
      try {
        setSyncStatus(`照片上传中 ${index + 1}/${files.length}`);
        setUploadState({
          memoryId,
          current: index + 1,
          total: files.length,
          failed,
        });

        const imageFile = await resizeImageFile(file);
        const path = `${museum.id}/${memoryId}/${Date.now()}-${index}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { error: photoError } = await supabase.from("memory_photos").insert({
          museum_id: museum.id,
          memory_id: memoryId,
          storage_path: path,
          uploaded_by: userId,
        });

        if (photoError) {
          throw photoError;
        }
      } catch {
        failed += 1;
      }
    }

    setUploadState({ memoryId, current: files.length, total: files.length, failed });

    if (failed) {
      setSyncStatus("部分照片失败");
      showNotice(`${failed} 张照片上传失败，可以重新选择再传一次`);
    } else {
      setSyncStatus("照片已同步");
      showNotice("已经收藏进我们的博物馆");
    }

    await loadMuseum();
    window.setTimeout(() => setUploadState(null), 2200);
  }

  async function addComment(memoryId, content) {
    if (!content.trim() || !museum?.id || !userId) {
      return;
    }

    setSyncStatus("正在留言");
    const { error } = await supabase.from("comments").insert({
      museum_id: museum.id,
      memory_id: memoryId,
      content: content.trim(),
      author_id: userId,
    });

    if (error) {
      setSyncStatus("留言失败");
      showNotice("留言没有保存成功");
      return;
    }

    setSyncStatus("已同步");
    showNotice("留言已经同步");
    await loadMuseum();
  }

  async function toggleReaction(memoryId, emoji) {
    if (!museum?.id || !userId) {
      return;
    }

    const existing = reactions.find(
      (item) =>
        item.memory_id === memoryId &&
        item.emoji === emoji &&
        item.user_id === userId,
    );

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("reactions").insert({
        museum_id: museum.id,
        memory_id: memoryId,
        emoji,
        user_id: userId,
      });
    }

    setSyncStatus("已同步");
    await loadMuseum();
  }

  async function addLetter() {
    if (!museum?.id || !userId) {
      return;
    }

    const { error } = await supabase.from("letters").insert({
      museum_id: museum.id,
      title: "一封新的信",
      content: "在这里写下想寄给未来的话。",
      unlock_at: null,
      author_id: userId,
    });

    if (error) {
      showNotice("信没有保存成功");
      return;
    }

    await loadMuseum();
  }

  async function updateLetter(letterId, field, value) {
    const column = { title: "title", content: "content" }[field];
    if (!column || !museum?.id) {
      return;
    }

    setLetters((items) =>
      items.map((item) =>
        item.id === letterId ? { ...item, [field]: value } : item,
      ),
    );

    const { error } = await supabase
      .from("letters")
      .update({ [column]: value })
      .eq("id", letterId)
      .eq("museum_id", museum.id);

    if (error) {
      showNotice("信件没有保存成功");
      await loadMuseum();
    }
  }

  async function importDefaultContent(targetMuseumId = museum?.id) {
    if (!targetMuseumId || !userId) {
      return;
    }

    const { data: existing } = await supabase
      .from("memories")
      .select("id")
      .eq("museum_id", targetMuseumId)
      .limit(1);

    if (existing?.length) {
      return;
    }

    await supabase.from("memories").insert(
      defaultContent.memories.map((item) => ({
        museum_id: targetMuseumId,
        title: item.title,
        memory_date: toDbDate(item.date),
        description: item.message,
        memory_type: item.type,
        achievement: item.achievement,
        author_id: userId,
      })),
    );

    await supabase.from("letters").insert(
      defaultContent.futureLetters.map((item) => ({
        museum_id: targetMuseumId,
        title: item.title,
        content: item.content,
        unlock_at: null,
        author_id: userId,
      })),
    );
  }

  return {
    configured: hasSupabaseConfig,
    session,
    authLoading,
    authNotice,
    museum,
    role,
    members,
    memories,
    letters,
    detailByMemoryId,
    syncStatus,
    notice,
    loadingMuseum,
    inviteLink,
    uploadState,
    requestEmailOtp,
    verifyEmailOtp,
    signOut,
    createMuseum,
    joinMuseum,
    createInvite,
    addMemory,
    updateMemory,
    uploadMemoryImage,
    addComment,
    toggleReaction,
    addLetter,
    updateLetter,
    reload: loadMuseum,
  };
}

async function createPhotoUrlMap(memories) {
  const entries = [];

  for (const memory of memories) {
    const photos = memory.memory_photos || [];
    for (const photo of photos) {
      const { data } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(photo.storage_path, 60 * 60);

      if (data?.signedUrl) {
        entries.push([photo.storage_path, data.signedUrl]);
      }
    }
  }

  return Object.fromEntries(entries);
}

function mapMemory(memory, signedPhotoUrls, index) {
  const photos = (memory.memory_photos || [])
    .map((photo) => ({
      ...photo,
      url: signedPhotoUrls[photo.storage_path],
    }))
    .filter((photo) => photo.url);

  return {
    id: memory.id,
    date: formatDate(memory.memory_date),
    title: memory.title,
    type: memory.memory_type || "日常",
    image: photos[0]?.url || `/placeholders/memory-${(index % 6) + 1}.svg`,
    photos,
    achievement: memory.achievement || "等待解锁的小成就",
    message: memory.description || "",
    authorId: memory.author_id,
    updatedAt: memory.updated_at,
    createdAt: memory.created_at,
  };
}

function mapLetter(letter) {
  return {
    id: letter.id,
    date: letter.unlock_at ? `解锁于 ${formatDate(letter.unlock_at)}` : "写给未来",
    title: letter.title,
    content: letter.content,
    createdAt: letter.created_at,
  };
}

function groupBy(items, key) {
  return items.reduce((result, item) => {
    const value = item[key];
    result[value] = result[value] || [];
    result[value].push(item);
    return result;
  }, {});
}

function toDbDate(value) {
  if (!value) {
    return null;
  }

  const normalized = value.replaceAll(".", "-");
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10).replaceAll("-", ".");
}
