# タスクボード（Amplify Gen 2 チュートリアル）

完了条件・手順の詳細は [`my-amplify-app/docs/tutorial-plan.md`](my-amplify-app/docs/tutorial-plan.md) を参照。

## 進捗

| # | ステップ | 状態 |
|---|----------|------|
| 1 | sandbox 起動（バックエンドをクラウドにデプロイ、`amplify_outputs.json` 生成） | ✅ 完了 |
| 2 | バックエンド（`Todo` モデル）= 既定のまま利用 | ✅ 完了 |
| 3 | フロント配線（`main.tsx` に `Amplify.configure`） | ✅ 完了 |
| 4 | フロント最小実装（`App.tsx` で Todo 表示・追加） | ✅ 完了 |
| 5 | ローカル動作確認（`npm run dev` で Todo 動作） | ✅ 完了 |
| 6 | 本番デプロイ（Amplify Hosting + GitHub 連携） | 🔜 作業中 |
| 7 | 本番 URL で動作確認 → 完了 | ⬜ 未着手 |

## ステップ6 の手順（本番デプロイ）

1. `my-amplify-app` を単体 Git リポジトリ化（`git init` → commit）
2. GitHub に新規リポジトリ作成 → push
3. Amplify コンソールで GitHub リポジトリ + `main` ブランチを接続（Gen 2 自動検出）
4. ビルド完了を待ち、本番 URL で Todo 動作を確認

## メモ

- 本番バックエンドは sandbox とは別環境。`main` への push で自動再デプロイ（CI/CD）。
- 後片付け: Amplify アプリ削除 + `npx ampx sandbox delete` で課金停止。
