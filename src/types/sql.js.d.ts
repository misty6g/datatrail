declare module "sql.js" {
  type InitSqlJs = (config?: {
    locateFile?: (file: string) => string;
    wasmBinary?: Uint8Array;
  }) => Promise<{
    Database: new () => {
      exec(sql: string): { columns: string[]; values: (string | number | Uint8Array | null)[][] }[];
      close(): void;
    };
  }>;

  const initSqlJs: InitSqlJs;
  export default initSqlJs;
}
