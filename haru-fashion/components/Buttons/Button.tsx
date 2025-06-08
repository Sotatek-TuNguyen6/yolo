import { FC } from "react";

type Props = {
  type?: "button" | "submit" | "reset";
  extraClass?: string;
  size?: "sm" | "lg" | "xl";
  value: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const Button: FC<Props> = ({
  size = "sm",
  value,
  extraClass,
  onClick,
  children,
  type = "button",
  disabled = false,
  loading = false,
}) => {
  let btnSize = "";
  if (size === "sm") {
    btnSize = "py-2 sm:py-1 px-5";
  } else if (size === "lg") {
    btnSize = "py-3 sm:py-2 px-6";
  } else {
    btnSize = "py-4 sm:py-3 px-7 text-xl";
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`text-xl sm:text-base ${btnSize} border border-gray500 ${
        disabled || loading
          ? "bg-gray400 text-gray300 cursor-not-allowed"
          : "bg-gray500 text-gray100 hover:text-gray300"
      } ${extraClass} relative`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          <span>Đang xử lý...</span>
        </div>
      ) : (
        <>
          {value} <span className="ml-1">{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
