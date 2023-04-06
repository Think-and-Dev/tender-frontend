import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";

// BUFFER pollyfill
// Required by rainbow
// see https://github.com/remix-run/remix/issues/2813#issuecomment-1458138043
import { Buffer } from "buffer-polyfill";
window.Buffer = Buffer as unknown as BufferConstructor;

hydrate(<RemixBrowser />, document);
