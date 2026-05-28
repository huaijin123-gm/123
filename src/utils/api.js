export async function fetchSharedMuseum() {
  const response = await fetch("/api/museum");

  if (!response.ok) {
    throw new Error("Failed to fetch shared museum");
  }

  return response.json();
}

export async function saveSharedMuseum(content) {
  const response = await fetch("/api/museum", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to save shared museum");
  }

  return response.json();
}
