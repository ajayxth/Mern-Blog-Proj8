import { useState } from "react";

type InputBoxProps = {
  name: string;
  type: string;
  id?: string;
  value?: string;
  placeholder: string;
  icon: string;
  disable?: boolean
};

const InputBox = ({
  name,
  type,
  id,
  value,
  placeholder,
  icon,
  disable = false
}: InputBoxProps) => {

    const [passwordVisible,setPasswordVisible] = useState(false)
  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={type == "password" ? passwordVisible ? "text" : "password" : type}
        placeholder={placeholder}
        defaultValue={value}
        id={id}
        className="input-box"
        disabled={disable}
      />

      <i className={"fi " + icon + " input-icon"}></i>

      {type == "password" ? (
        <i onClick={()=>setPasswordVisible(currentVal => !currentVal)} className={"fi fi-rr-eye"+(passwordVisible ? "-crossed" : "") + " input-icon left-[auto] right-4 cursor-pointer"}></i>
      ) : (
        ""
      )}
    </div>
  );
};

export default InputBox;
