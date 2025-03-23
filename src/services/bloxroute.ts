import { BLOXROUTE_API_KEY, BLOXROUTE_BSC_BUNDLE_URL } from "../utils/config";
import { getCurrentBlockNumber } from "./helper-contract";

export const sendBundleTxs = async (txs: string[]) => {
  const currentBlock = await getCurrentBlockNumber();
  const targetBlockHex = `0x${(currentBlock + 2n).toString(16)}`;

  const bundlePayload = {
    id: "1",
    method: "blxr_submit_bundle",
    // method: "blxr_simulate_bundle",
    params: {
      transaction: txs,
      blockchain_network: "BSC-Mainnet",
      block_number: targetBlockHex,
      mev_builders: {
        all: ""
      }
    }
  }

  const response = await fetch(BLOXROUTE_BSC_BUNDLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${BLOXROUTE_API_KEY}`,
    },
    body: JSON.stringify(bundlePayload),
  });
  const data = await response.json();
  console.log("data:", data);

  return data;
}