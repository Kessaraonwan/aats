"use client";

import { Toaster as SonnerToaster } from "sonner";

const ToasterComponent = (props) => {
  const theme = "light";

  return (
    <SonnerToaster
      theme={theme}
      className="toaster group"
      {...props}
    />
  );
};

export { ToasterComponent as Toaster };