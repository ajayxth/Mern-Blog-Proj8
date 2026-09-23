import { createContext, useContext, useState } from "react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const [resolveRequest, setResolveRequest] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    setRequest(options);
    setResolveRequest(() => resolve);
  });

  const close = (value: boolean) => {
    resolveRequest?.(value);
    setRequest(null);
    setResolveRequest(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {request && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-5" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-white border border-grey p-6 shadow-xl">
            <h2 className="font-gelasio text-2xl">{request.title || "Please confirm"}</h2>
            <p className="text-dark-grey mt-3 leading-6">{request.message}</p>
            <div className="flex justify-end gap-3 mt-7">
              <button type="button" onClick={() => close(false)} className="btn-light px-5 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={() => close(true)} className={`${request.danger ? "bg-red-500 text-white" : "btn-dark"} px-5 py-2 cursor-pointer`}>
                {request.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context.confirm;
};