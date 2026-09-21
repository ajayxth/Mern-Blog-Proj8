import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

interface InPageNavigationProps {
  routes: string[];
  defaultHidden: string[];
  children: ReactNode
}

export let activeTabLineRef: React.RefObject<HTMLHRElement | null>;
export let tabButtonsRef: React.RefObject<(HTMLButtonElement | null)[]>;

const InPageNavigation = ({ routes,defaultHidden = [], children }: InPageNavigationProps) => {
   activeTabLineRef = useRef<HTMLHRElement | null>(null);
   tabButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const [inPageNavIndex, setInPageNavIndex] = useState(0);

  const changePageState = (
    e: MouseEvent<HTMLButtonElement>,
    i: number
  ) => {
    const { offsetWidth, offsetLeft } = e.currentTarget;

    if (activeTabLineRef.current) {
      activeTabLineRef.current.style.width = offsetWidth + "px";
      activeTabLineRef.current.style.left = offsetLeft + "px";
    }

    setInPageNavIndex(i);
  };

  useEffect(() => {
    const firstButton = tabButtonsRef.current[0];

    if (firstButton && activeTabLineRef.current) {
      activeTabLineRef.current.style.width =
        firstButton.offsetWidth + "px";

      activeTabLineRef.current.style.left =
        firstButton.offsetLeft + "px";
    }
  }, []);

  return (
    <>
    <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
      {routes.map((route, i) => (
        <button
          ref={(el) => {
            tabButtonsRef.current[i] = el;
          }}
          onClick={(e) => changePageState(e, i)}
          key={i}
          className={
            "p-4 px-5 capitalize " +
            (inPageNavIndex === i ? "text-black" : "text-dark-grey ") +
            (defaultHidden.includes(route) ? "lg:hidden" : " ")
          }
        >
          {route}
        </button>
      ))}

      <hr
        ref={activeTabLineRef}
        className="absolute bottom-0 duration-300"
      />
    </div>

    {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;