function InlineEditable({
  as = "input",
  className = "",
  editMode,
  value,
  onChange,
  placeholder,
}) {
  if (!editMode) {
    return <>{value || placeholder}</>;
  }

  const sharedClassName = `${className} inline-edit-field`;

  if (as === "textarea") {
    return (
      <textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className={sharedClassName}
      />
    );
  }

  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={sharedClassName}
    />
  );
}

export default InlineEditable;
