import { Client } from "$mysql/mod.ts";
import { CommonClass, summarize_issuances } from "./index.ts";
import { SMALL_LIMIT, STAMP_TABLE, TTL_CACHE } from "constants";
import { PROTOCOL_IDENTIFIERS as SUBPROTOCOLS } from "utils/protocol.ts";
import { handleSqlQueryWithCache } from "utils/cache.ts";
import { get_suffix_from_mimetype } from "utils/util.ts";

export class StampsClass {
  static async get_total_stamps_with_client(client: Client) {
    return await handleSqlQueryWithCache(
      client,
      `
      SELECT COUNT(*) AS total
      FROM ${STAMP_TABLE}
      WHERE is_btc_stamp IS NOT NULL;
      `,
      [],
      1000 * 60 * 2,
    );
  }

  /**
   * Retrieves the total number of stamps by identifier(s) with the specified client.
   *
   * @param client - The database client.
   * @param ident - The identifier(s) of the stamps. It can be a single identifier or an array of identifiers.
   *                If it's a single identifier, it should be one of the values defined in the SUBPROTOCOLS enum.
   *                If it's an array of identifiers, each identifier should be one of the values defined in the SUBPROTOCOLS enum.
   * @returns A promise that resolves to the total number of stamps matching the identifier(s) with the client.
   */
  static async get_total_stamps_by_ident_with_client(
    client: Client,
    ident: typeof SUBPROTOCOLS | typeof SUBPROTOCOLS[] | string,
  ) {
    const identList = Array.isArray(ident) ? ident : [ident];
    const identCondition = identList.map((id) => `ident = '${id}'`).join(
      " OR ",
    );
    return await handleSqlQueryWithCache(
      client,
      `
      SELECT COUNT(*) AS total
      FROM ${STAMP_TABLE}
      WHERE (${identCondition})
      AND is_btc_stamp IS NOT NULL;
      `,
      [],
      1000 * 60 * 2,
    );
  }

  static async get_stamps_by_page_with_client(
    client: Client,
    limit = SMALL_LIMIT,
    page = 1,
    sort_order: "asc" | "desc" = "asc",
  ) {
    const offset = (page - 1) * limit;
    const order = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    return await handleSqlQueryWithCache(
      client,
      `
        SELECT st.*, cr.creator AS creator_name
        FROM ${STAMP_TABLE} AS st
        LEFT JOIN creator AS cr ON st.creator = cr.address
        WHERE st.is_btc_stamp IS NOT NULL
        ORDER BY st.stamp ${order}
        LIMIT ? OFFSET ?;
      `,
      [limit, offset],
      1000 * 60 * 2,
    );
  }

  static async get_resumed_stamps_by_page_with_client(
    client: Client,
    limit = SMALL_LIMIT,
    page = 1,
    order = "DESC",
  ) {
    order = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const offset = (page - 1) * limit;
    return await handleSqlQueryWithCache(
      client,
      `
      SELECT
        st.stamp,
        st.cpid,
        st.creator,
        cr.creator AS creator_name,
        st.tx_hash, st.stamp_mimetype,
        st.supply, st.divisible,
        st.locked,
        st.ident,
        st.block_time,
        st.block_index
      FROM ${STAMP_TABLE} AS st
      LEFT JOIN creator AS cr ON st.creator = cr.address
      WHERE st.is_btc_stamp IS NOT NULL AND (st.ident = 'STAMP' or st.ident = 'SRC-721')
      ORDER BY st.tx_index ?
      LIMIT ? OFFSET ?;
      `,
      [order, limit, offset],
      1000 * 60 * 2,
    );
  }

  static async get_resumed_stamps(
    client: Client,
    order = "DESC",
  ) {
    order = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    return await handleSqlQueryWithCache(
      client,
      `
      SELECT
        st.stamp,
        st.cpid,
        st.creator,
        cr.creator AS creator_name,
        st.tx_hash, st.stamp_mimetype,
        st.supply, st.divisible,
        st.locked,
        st.ident,
        st.block_time,
        st.block_index
      FROM ${STAMP_TABLE} AS st
      LEFT JOIN creator AS cr ON st.creator = cr.address
      WHERE st.is_btc_stamp IS NOT NULL AND (st.ident = 'STAMP' or st.ident = 'SRC-721')
      `,
      [],
      1000 * 60 * 2,
    );
  }

  static async get_stamps_by_block_index_with_client(
    client: Client,
    block_index: number,
  ) {
    return await handleSqlQueryWithCache(
      client,
      `
      SELECT st.*, cr.creator AS creator_name
      FROM ${STAMP_TABLE} AS st
      LEFT JOIN creator AS cr ON st.creator = cr.address
      WHERE st.block_index = ?
      AND st.is_btc_stamp IS NOT NULL
      ORDER BY stamp;
      `,
      [block_index],
      "never",
    );
  }

  static async get_stamps_by_ident_with_client(
    client: Client,
    ident: typeof SUBPROTOCOLS,
    limit = SMALL_LIMIT,
    page = 1,
  ) {
    const offset = (page - 1) * limit;
    return await handleSqlQueryWithCache(
      client,
      `
      SELECT st.*, cr.creator AS creator_name
      FROM ${STAMP_TABLE} AS st
      LEFT JOIN creator AS cr ON st.creator = cr.address
      WHERE st.ident = ?
      AND st.is_btc_stamp IS NOT NULL
      ORDER BY st.stamp
      LIMIT ? OFFSET ?;
      `,
      [ident, limit, offset],
      1000 * 60 * 2,
    );
  }

  static async get_stamp_by_identifier_or_stamp_with_client(
    client: Client,
    identifierOrStamp: string | number,
  ) {
    if (typeof identifierOrStamp === "number") {
      return await handleSqlQueryWithCache(
        client,
        `

        SELECT st.*, cr.creator AS creator_name
        FROM ${STAMP_TABLE} AS st
        LEFT JOIN creator AS cr ON st.creator = cr.address
        WHERE st.stamp = ?
        ORDER BY st.tx_index;
        `,
        [identifierOrStamp],
        TTL_CACHE,
      );
    } else if (typeof identifierOrStamp === "string") {
      return await handleSqlQueryWithCache(
        client,
        `
        SELECT st.*, cr.creator AS creator_name
        FROM ${STAMP_TABLE} AS st
        LEFT JOIN creator AS cr ON st.creator = cr.address
        WHERE (st.cpid = ? OR st.tx_hash = ? OR st.stamp_hash = ?);
        `,
        [identifierOrStamp, identifierOrStamp, identifierOrStamp],
        TTL_CACHE,
      );
    } else {
      throw new Error("Invalid argument type. Expected string or number.");
    }
  }

  static async get_stamp_file_by_identifier_with_client(
    client: Client,
    identifier: string,
  ) {
    const data = await handleSqlQueryWithCache(
      client,
      `
      SELECT tx_hash, stamp_hash, stamp_mimetype, cpid
      FROM ${STAMP_TABLE}
      WHERE (cpid = ? OR tx_hash = ? OR stamp_hash = ?)
      AND stamp IS NOT NULL;
      `,
      [identifier, identifier, identifier],
      TTL_CACHE,
    );
    if (!data) return null;
    const ext = get_suffix_from_mimetype(data.rows[0].stamp_mimetype);
    return `${data.rows[0].tx_hash}.${ext}`;
  }

  static async get_stamp_with_client(client: Client, id: string) {
    let data;
    if (!isNaN(Number(id))) {
      data = await CommonClass.get_issuances_by_stamp_with_client(
        client,
        Number(id),
      );
    } else {
      data = await CommonClass.get_issuances_by_identifier_with_client(
        client,
        id,
      );
    }
    if (!data) return null;
    const stamp = summarize_issuances(data.rows);
    return stamp;
  }

  static async get_cpid_from_identifier_with_client(
    client: Client,
    identifier: string,
  ) {
    if (!isNaN(Number(identifier))) {
      return await handleSqlQueryWithCache(
        client,
        `
        SELECT cpid FROM ${STAMP_TABLE}
        WHERE stamp = ?;
        `,
        [identifier],
        "never",
      );
    }
    return await handleSqlQueryWithCache(
      client,
      `
      SELECT cpid FROM ${STAMP_TABLE}
      WHERE (cpid = ? OR tx_hash = ?);
      `,
      [identifier, identifier],
      "never",
    );
  }
}
