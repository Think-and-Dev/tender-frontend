import { LoaderFunction, Response } from "@remix-run/node"; // or cloudflare/deno

export const loader:LoaderFunction = async () => {
  return new Response("100000000", {
    status: 200,
    headers: {
      "Content-Type": "text/json",
    },
  });
};
