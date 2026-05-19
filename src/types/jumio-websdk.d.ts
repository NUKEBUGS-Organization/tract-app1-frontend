import type { DetailedHTMLProps, HTMLAttributes } from "react";

type JumioSdkElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  dc?: "us" | "eu" | "sgp";
  token?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "jumio-sdk": JumioSdkElementProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "jumio-sdk": JumioSdkElementProps;
    }
  }
}

declare module "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "jumio-sdk": JumioSdkElementProps;
    }
  }
}

export {};