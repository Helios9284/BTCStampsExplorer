import { Client } from "$mysql/mod.ts";
import { summarize_issuances } from "./index.ts";
import { STAMP_TABLE, SEND_TABLE, BLOCK_TABLE } from "constants"
import { get_balances } from "utils/xcp.ts"
import { handleSqlQueryWithCache } from "utils/cache.ts"
import { TTL_CACHE } from "utils/constants.ts";

//------------------Blocks by index------------------
export const get_block_info_with_client = async (
  client: Client,
  block_index: number,
) => {
  return await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM blocks
    WHERE block_index = ?;
    `,
    [block_index],
    "never"
  );
};

export const get_last_block_with_client = async (client: Client) => {
  return await handleSqlQueryWithCache(
    client,
    `
    SELECT MAX(block_index)
    AS last_block
    FROM blocks;
    `,
    [],
    0
  );
};

export const get_last_x_blocks_with_client = async (
  client: Client,
  num = 10,
) => {
  const blocks = await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM blocks
    ORDER BY block_index DESC
    LIMIT ?;
    `,
    [num],
    0
  );
  const populated = blocks.rows.map(async (block) => {
    const tx_info_from_block = await handleSqlQueryWithCache(
      client,
      `
      SELECT COUNT(*) AS tx_count
      FROM ${STAMP_TABLE}
      WHERE block_index = ?;
      `,
      [block.block_index],
      "never"
    );

    return {
      ...block,
      tx_count: tx_info_from_block.rows[0]["tx_count"],
    };
  });
  return Promise.all(populated.reverse());
};

export const get_related_blocks_with_client = async (
  client: Client,
  block_index: number,
) => {
  const blocks = await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM blocks
    WHERE block_index >= ? - 2
    AND block_index <= ? + 2
    ORDER BY block_index DESC;
    `,
    [block_index, block_index],
    0
  );
  const populated = blocks?.rows?.map(async (block) => {
    const issuances_from_block = await handleSqlQueryWithCache(
      client,
      `
      SELECT COUNT(*) AS issuances
      FROM ${STAMP_TABLE}
      WHERE block_index = ?;
      `,
      [block.block_index],
      "never"
    );

    const sends_from_block = await handleSqlQueryWithCache(
      client,
      `
      SELECT COUNT(*) AS sends
      FROM sends
      WHERE block_index = ?;
      `,
      [block.block_index],
      "never"
    );

    return {
      ...block,
      issuances: issuances_from_block.rows[0]["issuances"] ?? 0,
      sends: sends_from_block.rows[0]["sends"] ?? 0,
    };
  });
  const result = await Promise.all(populated.reverse());
  return result;
};

export const get_issuances_by_block_index_with_client = async (
  client: Client,
  block_index: number,
) => {
  return await handleSqlQueryWithCache(
    client,
    `
    SELECT st.*, num.stamp AS stamp, num.is_btc_stamp AS is_btc_stamp
    FROM ${STAMP_TABLE} st
    LEFT JOIN (
        SELECT cpid, stamp, is_btc_stamp
        FROM ${STAMP_TABLE}
        WHERE stamp IS NOT NULL
        AND is_btc_stamp IS NOT NULL
    ) num ON st.cpid = num.cpid
    WHERE st.block_index = ?
    ORDER BY st.tx_index;
    `,
    [block_index],
    "never"
  );
};

export const get_sends_by_block_index_with_client = async (
  client: Client,
  block_index: number,
) => {
  return await handleSqlQueryWithCache(
    client,
    `
    SELECT s.*, st.*
    FROM sends s
    JOIN ${STAMP_TABLE} st ON s.cpid = st.cpid
    WHERE s.block_index = ?
      AND st.is_valid_base64 = true
      AND st.block_index = (SELECT MIN(block_index) 
                            FROM ${STAMP_TABLE} 
                            WHERE cpid = s.cpid 
                              AND is_valid_base64 = 1)
    ORDER BY s.tx_index;
    `,
    [block_index],
    "never"
  );
};

//------------------Blocks by hash------------------
export const get_block_info_by_hash_with_client = async (
  client: Client,
  block_hash: string,
) => {
  return await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM blocks
    WHERE block_hash = ?;
    `,
    [block_hash],
    "never"
  );
};
const get_block_index_by_hash_with_client = async (
  client: Client,
  block_hash: string,
) => {
  const result = await handleSqlQueryWithCache(
    client,
    `
    SELECT block_index
    FROM blocks
    WHERE block_hash = ?;
    `,
    [block_hash],
    "never"
  );
  return result?.rows?.[0]?.block_index;
};



export const get_related_blocks_by_hash_with_client = async (
  client: Client,
  block_hash: string,
) => {
  const block_index = await get_block_index_by_hash_with_client(client, block_hash);
  const blocks = await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM blocks
    WHERE block_index >= ? - 2
    AND block_index <= ? + 2
    ORDER BY block_index DESC;
    `,
    [block_index, block_index],
    0
  );
  const populated = blocks?.rows?.map(async (block) => {
    const issuances_from_block = await handleSqlQueryWithCache(
      client,
      `
      SELECT COUNT(*) AS issuances
      FROM ${STAMP_TABLE}
      WHERE block_index = ?;
      `,
      [block.block_index],
      "never"
    );

    const sends_from_block = await handleSqlQueryWithCache(
      client,
      `
      SELECT COUNT(*) AS sends
      FROM sends
      WHERE block_index = ?;
      `,
      [block.block_index],
      "never"
    );

    return {
      ...block,
      issuances: issuances_from_block.rows[0]["issuances"] ?? 0,
      sends: sends_from_block.rows[0]["sends"] ?? 0,
    };
  });
  const result = await Promise.all(populated.reverse());
  return result;
};

export const get_issuances_by_block_hash_with_client = async (
  client: Client,
  block_hash: string,
) => {
  return await handleSqlQueryWithCache(
    client,
    `
    SELECT st.*, num.stamp AS stamp, num.is_btc_stamp AS is_btc_stamp
    FROM ${STAMP_TABLE} st
    LEFT JOIN (
        SELECT cpid, stamp, is_btc_stamp
        FROM ${STAMP_TABLE}
        WHERE stamp IS NOT NULL
        AND is_btc_stamp IS NOT NULL
    ) num ON st.cpid = num.cpid
    WHERE st.block_hash = ?
    ORDER BY st.tx_index;
    `,
    [block_hash],
    "never"
  );
};

export const get_sends_by_block_hash_with_client = async (
  client: Client,
  block_hash: string,
) => {
  const block_index = await get_block_index_by_hash_with_client(client, block_hash);
  return await handleSqlQueryWithCache(
    client,
    `
    SELECT s.*, st.*
    FROM sends s
    JOIN ${STAMP_TABLE} st ON s.cpid = st.cpid
    WHERE s.block_index = ?
      AND st.is_valid_base64 = true
      AND st.block_index = (SELECT MIN(block_index) 
                            FROM ${STAMP_TABLE} 
                            WHERE cpid = s.cpid 
                              AND is_valid_base64 = 1)
    ORDER BY s.tx_index;
    `,
    [block_index],
    "never"
  );
};








// -------------Stamps--------------

export const get_issuances_by_stamp_with_client = async (
  client: Client,
  stamp: number,
) => {
  let issuances = await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM ${STAMP_TABLE}
    WHERE stamp = ?
    ORDER BY tx_index;
    `,
    [stamp],
    TTL_CACHE
  );
  const cpid = issuances?.rows[0]?.cpid;
  if (!cpid) return null;
  issuances = await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM ${STAMP_TABLE}
    WHERE (cpid = ?)
    ORDER BY tx_index;
    `,
    [cpid],
    TTL_CACHE
  );
  return issuances;
};

export const get_issuances_by_identifier_with_client = async (
  client: Client,
  identifier: string,
) => {
  let issuances = await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM ${STAMP_TABLE}
    WHERE (cpid = ? OR tx_hash = ? OR stamp_hash = ?)
    ORDER BY tx_index;
    `,
    [identifier, identifier, identifier],
    TTL_CACHE
  );
  const cpid = issuances.rows[0].cpid;
  issuances = await handleSqlQueryWithCache(
    client,
    `
    SELECT * FROM ${STAMP_TABLE}
    WHERE (cpid = ?)
    ORDER BY tx_index;
    `,
    [cpid],
    TTL_CACHE
  );
  return issuances;
};

export const get_stamp_balances_by_address_with_client = async (
  client: Client,
  address: string
) => {
  try {
    const xcp_balances = await get_balances(address);
    const assets = xcp_balances.map(balance => balance.cpid);

    const query = `
      SELECT 
        st.cpid, 
        st.stamp, 
        st.stamp_base64, 
        st.stamp_url, 
        st.stamp_mimetype, 
        st.tx_hash, 
        st.is_btc_stamp, 
        st.divisible, 
        st.supply, 
        st.locked, 
        st.creator, 
        cr.creator AS creator_name
      FROM 
        ${STAMP_TABLE} st
      LEFT JOIN 
        creator cr ON st.creator = cr.address
      WHERE 
        st.cpid IN (${assets.map(() => `?`).join(',')})
    `;
    const balances = await handleSqlQueryWithCache(client, query, assets, TTL_CACHE);

    const grouped = balances.rows.reduce((acc, cur) => {
      acc[cur.cpid] = acc[cur.cpid] || [];
      acc[cur.cpid].push(cur);
      return acc;
    }, {});

    const summarized = Object.keys(grouped).map(key => summarize_issuances(grouped[key]));

    return summarized.map(summary => {
      const xcp_balance = xcp_balances.find(balance => balance.cpid === summary.cpid);
      return {
        ...summary,
        balance: xcp_balance ? xcp_balance.quantity : 0,
      };
    });
  } catch (error) {
    console.error("Error getting balances: ", error);
    return [];
  }
};


export const get_sends_for_cpid_with_client = async (client: Client, cpid: string) => {
  const query = `
    SELECT s.*, b.block_time FROM ${SEND_TABLE} AS s
    LEFT JOIN ${BLOCK_TABLE} AS b ON s.block_index = b.block_index
    WHERE s.cpid = ?
    ORDER BY s.tx_index;
  `;
  return await handleSqlQueryWithCache(
    client,
    query,
    [cpid],
    1000 * 60 * 60
  );
}
