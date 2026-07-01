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
| 6 | 本番デプロイ（Amplify Hosting + GitHub 連携） | 🔜 作業中（ビルド修正済み・検証中） |
| 7 | 本番 URL で動作確認 → 完了 | ⬜ 未着手 |

## ステップ6 の手順（本番デプロイ）

1. ~~`my-amplify-app` を単体 Git リポジトリ化~~ → 実際は **`0_TutorialDeploy` をルートにモノレポ化**（`appRoot: my-amplify-app`）
2. ✅ GitHub リポジトリ `kuru-bushi/aws-tutorial-amplify-deploy` 作成 → push
3. ✅ Amplify（app-id `d1nxlsv0gzt6u4`, 東京 `ap-northeast-1`）に接続、`main` ブランチ
4. 🔜 ビルド成功を待ち、本番 URL で Todo 動作を確認

## ステップ6 で発生したビルド失敗と対処（履歴）

| # | 失敗内容 | 対処 |
|---|----------|------|
| 1 | `npm ci` が lock 非同期で失敗（`semver 7.7.1` vs `7.8.5`） | `amplify.yml` を `npm ci`→`npm install` に変更 |
| 2 | `tsc` 型エラー `App.tsx(19): string is not assignable to string[]` | `create({ content } as any)` で回避（aws-amplify 型退化の既知不整合。`npm run dev` は型チェックせず露見せず、`npm run build` で検出） |

- **教訓: push 前に必ずローカルで `npm run build` を通す**（`npm run dev` は型チェックしない）。詳細は README「デプロイ前チェック」参照。

## メモ

- 本番バックエンドは sandbox とは別環境。`main` への push で自動再デプロイ（CI/CD）。
- ビルドログ取得: IAM に `amplify:ListJobs`/`GetJob` 付与済み。`aws amplify get-job ... logUrl` → `curl -o tmp.txt` → `grep`。
- 後片付け: Amplify アプリ削除 + `npx ampx sandbox delete` で課金停止。
