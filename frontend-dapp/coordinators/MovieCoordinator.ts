import bs58 from "bs58";
import * as web3 from "@solana/web3.js";
import { Movie } from "../models/Movie";
import { MOVIE_REVIEW_PROGRAM_ID } from "../constant";

export class MovieCoordinator {
  static accounts: web3.PublicKey[] = [];

  static async prefetchAccounts(connection: web3.Connection, search: string) {
    const accounts = await connection.getProgramAccounts(
      new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
      {
        dataSlice: { offset: 2, length: 18 },
        filters:
          search === ""
            ? []
            : [
                {
                  memcmp: {
                    offset: 6,
                    bytes: bs58.encode(Buffer.from(search)),
                  },
                },
              ],
      }
    );

    accounts.sort((a, b) => {
      let lengthA = 0;
      let lengthB = 0;
      try {
        // 可能有的标题是空的，或者没有那么长，读取就会报错
        lengthA = a.account.data.readUInt32LE(0);
      } catch (e) {
        // 标题不存在就排到后面去
        return 1;
      }

      try {
        lengthB = b.account.data.readUInt32LE(0);
      } catch (e) {
        // 标题不存在就排到后面去
        return 1;
      }

      if (lengthA && lengthB) {
        const dataA = a.account.data.subarray(4, 4 + lengthA);
        const dataB = b.account.data.subarray(4, 4 + lengthB);

        let titleA = dataA.toString();
        let titleB = dataB.toString();

        let result = dataA.compare(dataB);
        let pos = {
          1: "之后",
          [-1]: "之前",
          0: "相同",
        };
        console.log(`排序 《${titleA}》在 《${titleB}》${pos[result]}`);

        return result;
      }

      // 排到后面去
      return 1;
    });

    this.accounts = accounts.map((account) => account.pubkey);
  }

  static async fetchPage(
    connection: web3.Connection,
    page: number,
    perPage: number,
    search: string,
    reload: boolean = false
  ): Promise<Movie[]> {
    if (this.accounts.length === 0 || reload) {
      await this.prefetchAccounts(connection, search);
    }

    const paginatedPublicKeys = this.accounts.slice(
      (page - 1) * perPage,
      page * perPage
    );

    if (paginatedPublicKeys.length === 0) {
      return [];
    }

    const accounts = await connection.getMultipleAccountsInfo(
      paginatedPublicKeys
    );

    const movies = accounts.reduce((accum: Movie[], account) => {
      const movie = Movie.deserialize(account?.data);
      if (!movie) {
        return accum;
      }

      return [...accum, movie];
    }, []);

    return movies;
  }
}
