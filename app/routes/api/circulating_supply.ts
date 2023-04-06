import { LoaderFunction, Response } from "@remix-run/node"; // or cloudflare/deno
import { Alchemy, Network, OwnedToken } from "alchemy-sdk";

const tndAddress = "0xC47D9753F3b32aA9548a7C3F30b6aEc3B2d2798C";
const multisigAddress = "0x80b54e18e5Bb556C6503e1C6F2655749c9e41Da2";
const teamVestingAddress = "0xE356aB88bA1a4f9D36928407fEAD0FbA50Eb139d";
const esTNDvesterAddress = "0x2da1594d3642B85CD83b9e13d70756337F4c5C7e";
const advisorVestingAddress = esTNDvesterAddress;

async function getTokenData(address: string) {
    const tokenData = await alchemy.core.getTokensForOwner(address, {
        contractAddresses: [tndAddress]
    })
    return parseResponse(tokenData["tokens"]);
}

function parseResponse(tokens: OwnedToken[]) {
    const tndToken = tokens.find((token: any) => token.symbol === "TND");
    return Math.round(parseFloat(tndToken?.balance ?? "0"));
}

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ARB_MAINNET,
};

const alchemy = new Alchemy(config);

export const loader: LoaderFunction = async ({ request }) => {

  const multisigSupply = await getTokenData(multisigAddress);
  const teamVestingSupply = await getTokenData(teamVestingAddress);
  const esTNDvestingSupply = await getTokenData(esTNDvesterAddress);
  const advisorVestingSupply = await getTokenData(advisorVestingAddress);

  const result: string = (
    10000000 -
    multisigSupply -
    teamVestingSupply -
    esTNDvestingSupply -
    advisorVestingSupply
  ).toString();

  return new Response(result, {
    status: 200,
    headers: {
      "Content-Type": "text/json",
    },
  });
};
