import { imageUrl } from "../utils/format";

export default function Avatar({ user, size = 32 }) {
  const name = user?.username || "?";
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };

  if (user?.profileImage) {
    return <img className="avatar" style={style} src={imageUrl(user.profileImage)} alt="" />;
  }
  return (
    <span className="avatar avatar-fallback" style={style} aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
