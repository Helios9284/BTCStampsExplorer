// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_v2_balance_address_ from "./routes/api/v2/balance/[address].ts";
import * as $api_v2_block_block_index_ from "./routes/api/v2/block/[block_index].ts";
import * as $api_v2_block_block_count_number_ from "./routes/api/v2/block/block_count/[...number].ts";
import * as $api_v2_block_related_block_index_ from "./routes/api/v2/block/related/[block_index].ts";
import * as $api_v2_cursed_id_ from "./routes/api/v2/cursed/[id].ts";
import * as $api_v2_cursed_block_block_index_ from "./routes/api/v2/cursed/block/[block_index].ts";
import * as $api_v2_cursed_ident_ident_ from "./routes/api/v2/cursed/ident/[ident].ts";
import * as $api_v2_cursed_index from "./routes/api/v2/cursed/index.ts";
import * as $api_v2_issuances_id_ from "./routes/api/v2/issuances/[id].ts";
import * as $api_v2_src20_balance_address_ from "./routes/api/v2/src20/balance/[address].ts";
import * as $api_v2_src20_balance_address_tick_ from "./routes/api/v2/src20/balance/[address]/[tick].ts";
import * as $api_v2_src20_tick_tick_deploys from "./routes/api/v2/src20/tick/[tick]/deploys.ts";
import * as $api_v2_src20_tick_tick_index from "./routes/api/v2/src20/tick/[tick]/index.ts";
import * as $api_v2_src20_tick_index from "./routes/api/v2/src20/tick/index.ts";
import * as $api_v2_src20_tx_tx_hash_ from "./routes/api/v2/src20/tx/[tx_hash].ts";
import * as $api_v2_stamps_id_ from "./routes/api/v2/stamps/[id].ts";
import * as $api_v2_stamps_balance_address_ from "./routes/api/v2/stamps/balance/[address].tsx";
import * as $api_v2_stamps_block_block_index_ from "./routes/api/v2/stamps/block/[block_index].ts";
import * as $api_v2_stamps_ident_ident_ from "./routes/api/v2/stamps/ident/[ident].ts";
import * as $api_v2_stamps_index from "./routes/api/v2/stamps/index.ts";
import * as $block_id_ from "./routes/block/[id].tsx";
import * as $block_index from "./routes/block/index.tsx";
import * as $content_imgpath_ from "./routes/content/[...imgpath].tsx";
import * as $cursed_index from "./routes/cursed/index.tsx";
import * as $index from "./routes/index.tsx";
import * as $stamp_id_ from "./routes/stamp/[id].tsx";
import * as $stamp_index from "./routes/stamp/index.tsx";
import * as $wallet_address_ from "./routes/wallet/[address].tsx";
import * as $BlockSelector from "./islands/BlockSelector.tsx";
import * as $Header from "./islands/Header.tsx";
import * as $MempoolWeather from "./islands/MempoolWeather.tsx";
import * as $Toast_ToastComponent from "./islands/Toast/ToastComponent.tsx";
import * as $Toast_toast from "./islands/Toast/toast.tsx";
import * as $Wallet_ConnectWallet from "./islands/Wallet/ConnectWallet.tsx";
import * as $Wallet_ConnectedModal from "./islands/Wallet/ConnectedModal.tsx";
import * as $Wallet_ConnectorsModal from "./islands/Wallet/ConnectorsModal.tsx";
import * as $Wallet_WalletModal from "./islands/Wallet/WalletModal.tsx";
import * as $Wallet_connectors_Wallet_connector from "./islands/Wallet/connectors/Wallet.connector.tsx";
import * as $hooks_useFeePolling from "./islands/hooks/useFeePolling.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/v2/balance/[address].ts": $api_v2_balance_address_,
    "./routes/api/v2/block/[block_index].ts": $api_v2_block_block_index_,
    "./routes/api/v2/block/block_count/[...number].ts":
      $api_v2_block_block_count_number_,
    "./routes/api/v2/block/related/[block_index].ts":
      $api_v2_block_related_block_index_,
    "./routes/api/v2/cursed/[id].ts": $api_v2_cursed_id_,
    "./routes/api/v2/cursed/block/[block_index].ts":
      $api_v2_cursed_block_block_index_,
    "./routes/api/v2/cursed/ident/[ident].ts": $api_v2_cursed_ident_ident_,
    "./routes/api/v2/cursed/index.ts": $api_v2_cursed_index,
    "./routes/api/v2/issuances/[id].ts": $api_v2_issuances_id_,
    "./routes/api/v2/src20/balance/[address].ts":
      $api_v2_src20_balance_address_,
    "./routes/api/v2/src20/balance/[address]/[tick].ts":
      $api_v2_src20_balance_address_tick_,
    "./routes/api/v2/src20/tick/[tick]/deploys.ts":
      $api_v2_src20_tick_tick_deploys,
    "./routes/api/v2/src20/tick/[tick]/index.ts": $api_v2_src20_tick_tick_index,
    "./routes/api/v2/src20/tick/index.ts": $api_v2_src20_tick_index,
    "./routes/api/v2/src20/tx/[tx_hash].ts": $api_v2_src20_tx_tx_hash_,
    "./routes/api/v2/stamps/[id].ts": $api_v2_stamps_id_,
    "./routes/api/v2/stamps/balance/[address].tsx":
      $api_v2_stamps_balance_address_,
    "./routes/api/v2/stamps/block/[block_index].ts":
      $api_v2_stamps_block_block_index_,
    "./routes/api/v2/stamps/ident/[ident].ts": $api_v2_stamps_ident_ident_,
    "./routes/api/v2/stamps/index.ts": $api_v2_stamps_index,
    "./routes/block/[id].tsx": $block_id_,
    "./routes/block/index.tsx": $block_index,
    "./routes/content/[...imgpath].tsx": $content_imgpath_,
    "./routes/cursed/index.tsx": $cursed_index,
    "./routes/index.tsx": $index,
    "./routes/stamp/[id].tsx": $stamp_id_,
    "./routes/stamp/index.tsx": $stamp_index,
    "./routes/wallet/[address].tsx": $wallet_address_,
  },
  islands: {
    "./islands/BlockSelector.tsx": $BlockSelector,
    "./islands/Header.tsx": $Header,
    "./islands/MempoolWeather.tsx": $MempoolWeather,
    "./islands/Toast/ToastComponent.tsx": $Toast_ToastComponent,
    "./islands/Toast/toast.tsx": $Toast_toast,
    "./islands/Wallet/ConnectWallet.tsx": $Wallet_ConnectWallet,
    "./islands/Wallet/ConnectedModal.tsx": $Wallet_ConnectedModal,
    "./islands/Wallet/ConnectorsModal.tsx": $Wallet_ConnectorsModal,
    "./islands/Wallet/WalletModal.tsx": $Wallet_WalletModal,
    "./islands/Wallet/connectors/Wallet.connector.tsx":
      $Wallet_connectors_Wallet_connector,
    "./islands/hooks/useFeePolling.tsx": $hooks_useFeePolling,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
