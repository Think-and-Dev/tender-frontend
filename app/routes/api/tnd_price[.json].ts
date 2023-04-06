import { LoaderFunction, json } from "@remix-run/node"; // or cloudflare/deno
import { Tendies } from "~/config/networks/arbitrum";

let contract = Tendies.Tokens.TND.address

async function getCoingeckoPrice() {
    let response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${contract}&vs_currencies=usd`)
    let data = await response.json() as {[contract: string]: {"usd": number}}
    return data[contract].usd
}

async function getDexScreenerPrice(){
    let response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/arbitrum/0x88B553F99bf8Cc6c18435C0c19D4d9B433d83645`)
    let data = await response.json() as {pair: {priceUsd: string}}
    console.log(data)
    return parseFloat(data["pair"]["priceUsd"])
}

let sources = [getCoingeckoPrice, getDexScreenerPrice];

async function getRandomPriceFeed(): Promise<number | undefined> {
    let randomSources = sources.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    
    for (let source of randomSources) {
        try {
            return source() 
        } catch (e) {
            console.error("API call timed out for", source.name, e)
        }
        console.error("Could not load TND Price")
    }

}

export const loader:LoaderFunction = async ({ request }) => {
    // query the choices in a random order
    let price = await getRandomPriceFeed()
    return json({usd: price}, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": `public, max-age=240, stale-if-error=600`,
        },
    });
};
