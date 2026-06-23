# きろくま (kirokuma)

体重・食事・筋トレを記録する個人向けフィットネスアプリです。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Dexie.js (IndexedDB)

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## コマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run test` | 単体テスト実行 |


## バックアップと復元

設定画面の「データを保存・復元」から、ローカル保存データをきろくま専用のJSONファイルとしてエクスポートできます。

- エクスポート対象はIndexedDBに保存された設定、体重、筋トレ、食事、食事写真、食材、レシピなどの全データです。
- インポートは追加ではなく、現在のローカルデータをJSONの内容で上書きします。
- 不正なJSONや、きろくまのバックアップ形式ではないJSONは読み込めません。
- JSONには食事写真データも含まれるため、ファイルサイズが大きくなることがあります。
- クラウド同期や自動バックアップではないため、エクスポートしたファイルは自分で安全な場所に保管してください。
