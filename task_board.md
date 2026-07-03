# タスクボード（Amplify Gen 2 チュートリアル）

完了条件・手順の詳細は [`my-amplify-app/docs/tutorial-plan.md`](my-amplify-app/docs/tutorial-plan.md) を参照。
再デプロイ手順は [`docs/redeploy-runbook.md`](docs/redeploy-runbook.md) を参照。

## 現在の状態（2026-07-03）

**AWS 上のリソースは全削除済み。コード（GitHub）はそのまま残っている。**
ローカルのソース／GitHub リポジトリは無傷なので、[`docs/redeploy-runbook.md`](docs/redeploy-runbook.md) の手順で**いつでも再デプロイ可能**。

## 進捗

| # | ステップ | 状態 |
|---|----------|------|
| 1 | sandbox 起動（バックエンドをクラウドにデプロイ、`amplify_outputs.json` 生成） | ✅ 完了 → 🗑️ 削除済み |
| 2 | バックエンド（`Todo` モデル）= 既定のまま利用 | ✅ 完了 |
| 3 | フロント配線（`main.tsx` に `Amplify.configure`） | ✅ 完了 |
| 4 | フロント最小実装（`App.tsx` で Todo 表示・追加） | ✅ 完了 |
| 5 | ローカル動作確認（`npm run dev` で Todo 動作） | ✅ 完了 |
| 6 | 本番デプロイ（Amplify Hosting + GitHub 連携） | ✅ 完了 → 🗑️ 削除済み |
| 7 | 本番 URL で動作確認 → 完了 | ✅ 動作確認済み → 🗑️ 削除済み |

## 削除記録（2026-07-03 実施：課金停止のため全削除）

削除前に稼働していた構成（再デプロイ時の参考。app-id は削除で無効化＝再作成で新しい id が発行される）:

| 項目 | 値（削除前） |
|------|--------------|
| 本番 Amplify Hosting アプリ | `aws-tutorial-amplify-deploy`（app-id `d1nxlsv0gzt6u4`） |
| リージョン | `ap-northeast-1`（東京） |
| 本番 URL | `https://main.d1nxlsv0gzt6u4.amplifyapp.com`（無効化済み） |
| 接続ブランチ | `main`（PRODUCTION） |
| 本番バックエンド root stack | `amplify-d1nxlsv0gzt6u4-main-branch-02e1209c1e` |
| sandbox root stack | `amplify-myamplifyapp-kunia-sandbox-ed5e2aa722` |
| GitHub リポジトリ | `kuru-bushi/aws-tutorial-amplify-deploy`（**削除せず維持**） |

削除対象（3つ）: ①sandbox スタック（`ampx sandbox delete`）②本番 Amplify アプリ（`amplify delete-app`）③本番バックエンド CloudFormation root stack。
→ 実施結果は本ファイル末尾「削除の実施ログ」に記録。

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

## 削除の実施ログ（2026-07-03・検証済み）

| # | 対象 | 実行 | 結果 |
|---|------|------|------|
| 1 | sandbox（`amplify-myamplifyapp-kunia-sandbox-ed5e2aa722`） | `npx ampx sandbox delete -y` | ✅ DELETE_COMPLETE |
| 2 | 本番 Amplify アプリ（app-id `d1nxlsv0gzt6u4`） | `aws amplify delete-app` | ✅ 削除（`list-apps` 空） |
| 3 | 本番バックエンド root stack（`...-main-branch-02e1209c1e`） | `aws cloudformation delete-stack`（delete-app で消し残ったため明示削除） | ✅ DELETE_COMPLETE |

**オーファン検証（全て空＝課金対象なし）**: `amplify list-apps` 空／amplify 関連 CloudFormation スタック残存なし／DynamoDB テーブルなし／Cognito user pool なし。

再デプロイは [`docs/redeploy-runbook.md`](docs/redeploy-runbook.md) を参照（app-id は無効化済み → Amplify アプリを新規作成する）。

## メモ

- 本番バックエンドは sandbox とは別環境。`main` への push で自動再デプロイ（CI/CD）。
- ビルドログ取得: IAM に `amplify:ListJobs`/`GetJob` 付与済み。`aws amplify get-job ... logUrl` → `curl -o tmp.txt` → `grep`。
- 後片付け: Amplify アプリ削除 + `npx ampx sandbox delete` で課金停止。**delete-app はバックエンドの CloudFormation root stack を消し残すことがある**ので、削除後に必ず残存スタックを確認して root を明示削除する。
