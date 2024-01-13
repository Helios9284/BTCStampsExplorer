import * as bitcoin from "bitcoin";
import { crypto } from "crypto";
import { BigFloat } from "bigfloat/mod.ts";
import { Client } from "$mysql/mod.ts";

import { address_from_pubkeyhash, scramble } from "utils/minting/utils.ts";
import { connectDb, Src20Class } from "$lib/database/index.ts";

interface SRC20Input {
  network: string;
  utxos: unknown[];
  changeAddress: string;
  toAddress: string;
  feeRate: number;
  transferString: string;
  action: string;
  publicKey: string;
}

interface IMintSRC20 {
  recipient: string;
  tick: string;
  amount: string;
}

async function checkMintedOut(
  client: Client,
  tick: string,
  amount: string,
) {
  try {
    const mint_status = await Src20Class
      .get_src20_minting_progress_by_tick_with_client(
        client,
        tick,
      );
    if (!mint_status) {
      throw new Error("Tick not found");
    }
    const { max_supply, total_minted } = mint_status;
    if (BigFloat(total_minted).add(BigFloat(amount)).gt(max_supply)) {
      return { ...mint_status, minted_out: true };
    }
    return { ...mint_status, minted_out: false };
  } catch (error) {
    console.error(error);
    throw new Error("Error: Internal server error");
  }
}

async function mintSRC20({
  recipient,
  tick,
  amount,
}: IMintSRC20) {
  try {
    const client = await connectDb();

    const mint_info = await checkMintedOut(
      client,
      tick,
      amount,
    );
    if (mint_info.minted_out === true) {
      throw new Error("Minted out");
    }
    if (new BigFloat(amount).gt(mint_info.lim)) {
      amount = mint_info.lim;
    }
    const src20_mint_obj = {
      op: "MINT",
      p: "SRC-20",
      tick: tick,
      amt: amount,
    };
    const src20_string = JSON.stringify(src20_mint_obj, null, 2);
    console.log(src20_string);
  } catch (error) {
    console.error(error);
    throw new Error("Error: Internal server error");
  }
}

export const prepareSendSrc20 = async ({
  network,
  utxos,
  changeAddress,
  toAddress,
  feeRate,
  transferString,
  publicKey,
}: SRC20Input) => {
  const psbtNetwork = network === "testnet"
    ? bitcoin.networks.testnet
    : bitcoin.networks.bitcoin;
  const psbt = new bitcoin.Psbt({ network: psbtNetwork });
  const sortedUtxos = utxos.sort((a, b) => b.value - a.value);

  let vouts = [{ address: toAddress, value: 808 }];

  let transferHex = Buffer.from(transferString, "utf-8").toString("hex");
  let count = (transferHex.length / 2).toString(16);
  let padding = "";
  for (let i = count.length; i < 4; i++) {
    padding += "0";
  }
  transferHex = padding + count + transferHex;

  let remaining = transferHex.length % (62 * 2);
  if (remaining > 0) {
    for (let i = 0; i < 62 * 2 - remaining; i++) {
      transferHex += "0";
    }
  }
  const encryption = bin2hex(
    scramble(hex2bin(sortedUtxos[0].txid), hex2bin(transferHex)),
  );
  let chunks = [];
  for (let i = 0; i < encryption.length; i = i + 62 * 2) {
    chunks.push(encryption.substring(i, i + 62 * 2));
  }
  chunks = chunks.map((datachunk) => {
    const pubkey_seg1 = datachunk.substring(0, 62);
    const pubkey_seg2 = datachunk.substring(62, 124);
    let second_byte;
    let pubkeyhash;
    let address1 = "";
    let address2 = "";

    while (address1.length == 0) {
      const first_byte = Math.random() > 0.5 ? "02" : "03";
      second_byte = crypto.randomBytes(1).toString("hex");
      pubkeyhash = first_byte + pubkey_seg1 + second_byte;

      if (bitcore.PublicKey.isValid(pubkeyhash)) {
        var hash1 = pubkeyhash;
        address1 = address_from_pubkeyhash(pubkeyhash);
      }
    }

    while (address2.length == 0) {
      const first_byte = Math.random() > 0.5 ? "02" : "03";
      second_byte = crypto.randomBytes(1).toString("hex");
      pubkeyhash = first_byte + pubkey_seg2 + second_byte;

      if (bitcore.PublicKey.isValid(pubkeyhash)) {
        const hash2 = pubkeyhash;
        address2 = address_from_pubkeyhash(pubkeyhash);
      }
    }
    var data_hashes = [hash1, hash2];
    return data_hashes;
  });

  const cpScripts = chunks.map((each) => {
    return `5121${each[0]}21${
      each[1]
    }2102020202020202020202020202020202020202020202020202020202020202020253ae`;
  });
  for (let cpScriptHex of cpScripts) {
    vouts.push({
      script: Buffer.from(cpScriptHex, "hex"),
      value: 810,
    });
  }

  let feeTotal = 0;
  for (let vout of vouts) {
    feeTotal += vout.value;
  }

  const { inputs, fee, change } = selectSrc20Utxos(sortedUtxos, vouts, feeRate);
  if (!inputs) {
    throw new Error(`Not enough BTC balance`);
  }

  for (let input of inputs) {
    const txDetails = await getTransaction(network, input.txid);
    const inputDetails = txDetails.vout[input.vout];
    const isWitnessUtxo = inputDetails.scriptPubKey.type.startsWith("witness");
    let psbtInput = {
      hash: input.txid,
      index: input.vout,
    };
    if (isWitnessUtxo) {
      psbtInput.witnessUtxo = {
        script: Buffer.from(inputDetails.scriptPubKey.hex, "hex"),
        value: input.value,
      };
    } else {
      psbtInput.nonWitnessUtxo = Buffer.from(txDetails.hex, "hex");
    }

    // 3xxxx: needs to add redeem for p2sh
    if (changeAddress.startsWith("3")) {
      const redeem = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(publicKey, "hex"),
      });
      psbtInput.redeemScript = redeem.output;
    }

    psbt.addInput(psbtInput);
  }
  for (let vout of vouts) {
    psbt.addOutput(vout);
  }
  psbt.addOutput({
    address: changeAddress,
    value: change,
  });

  const psbtHex = psbt.toHex();
  return psbtHex;
};
