import cornerLogo from "../assets/corner_logo.svg";

interface BrandProps {
  imageSrc?: string;
}

export function BrandCorner(props: BrandProps) {
  const imgSrc = props.imageSrc || cornerLogo;
  return (
    <img
      src={imgSrc}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
      }}
      onClick={() => (window.location.href = "/")}
    ></img>
  );
}
