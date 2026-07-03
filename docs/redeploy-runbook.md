# 再デプロイ手順（Redeploy Runbook）

2026-07-03 に **AWS 上のリソースを全削除**（課金停止）した。
**コード（ローカル／GitHub `kuru-bushi/aws-tutorial-amplify-deploy`）はそのまま残っている**ので、
この手順に沿えばいつでも本番環境を作り直せる。

> ⚠️ 削除前の app-id `d1nxlsv0gzt6u4` は**無効**。再デプロイでは **Amplify アプリを新規作成**する
> （新しい app-id・新しい URL が発行される）。詳細な背景・トラブル対処は
> [`../skills.md`](../skills.md) と [`../my-amplify-app/README.md`](../my-amplify-app/README.md) を参照。

---

## 全体像（3 ステップ）

1. **バックエンドのリハーサル**（sandbox）… 任意だが推奨。認証・データ・CDK 展開の事前検証。
2. **本番デプロイ**（Amplify Hosting を新規作成し GitHub に接続）… CI/CD が本番バックエンドも構築する。
3. **本番 URL で動作確認**。

コードは既に完成しているので、**編集は不要**。基本は「ビルド検証 → 接続 → 待つ」だけ。

---

## 事前チェック（必須）

push する前に、**クラウドと同じビルドをローカルで通す**（無駄なデプロイを消す鉄則）。

```bash
cd my-amplify-app
rm -rf node_modules && npm ci && npm run build   # dist/ が生成されれば OK
cd ..
```

機密・生成物がコミット対象に混ざっていないことも確認（`.gitignore` 済みのはず）。

```bash
git ls-files | grep -iE "amplify_outputs|\.env|credentials" || echo "OK（機密なし）"
```

---

## ステップ 1：sandbox でリハーサル（推奨・任意）

```bash
cd my-amplify-app
npx ampx sandbox        # 個人バックエンドをクラウドに立て、amplify_outputs.json を生成
# 動作確認したら Ctrl+C で停止。使い終えたら課金停止のため削除:
npx ampx sandbox delete -y
cd ..
```

> sandbox が成功する＝本番の `pipeline-deploy`（認証・モデル・CDK 展開）もほぼ通る、というリハーサルになる。

---

## ステップ 2：本番デプロイ（Amplify Hosting を新規作成）

コードは GitHub に push 済み。追加の変更があるときだけ push する。

```bash
# 変更があれば（0_TutorialDeploy で実行）
git add -A && git commit -m "..." && git push
```

Amplify コンソールで**新規アプリ**を作成して接続する：

1. Amplify コンソール（`ap-northeast-1` / 東京）→ **「Deploy an app」→ GitHub を認可**
2. リポジトリ `kuru-bushi/aws-tutorial-amplify-deploy` / ブランチ `main` を選択
3. **Monorepo にチェックし、App root に `my-amplify-app` を指定**（必須。ルートは `0_TutorialDeploy`、アプリ本体はサブフォルダ）
4. ビルド定義はリポジトリ直下の [`../amplify.yml`](../amplify.yml) が使われる（`appRoot: my-amplify-app`）
5. 保存すると push を検知して自動ビルド開始 → 成功で **新しい `https://main.<新app-id>.amplifyapp.com`** が発行される

> 発行後は `aws amplify list-apps --region ap-northeast-1` で新しい app-id / URL を確認できる。

---

## ステップ 3：本番確認

発行された本番 URL を開き、Todo の**表示・追加**が動けば完了。

---

## 使い終わったら（課金停止・再度の全削除）

放置すると課金され続けるため、学習が済んだら以下で全削除する（今回 2026-07-03 に実施した手順）。

```bash
# 1. sandbox を消す（立てていれば）
cd my-amplify-app && npx ampx sandbox delete -y && cd ..

# 2. 本番 Amplify アプリを消す（<new-app-id> は list-apps で確認）
aws amplify delete-app --app-id <new-app-id> --region ap-northeast-1

# 3. 本番バックエンドの CloudFormation root stack が残ることがあるので確認して消す
#    （delete-app はバックエンドスタックを消し残す場合がある。root だけ消せば nested は連鎖削除）
aws cloudformation list-stacks --region ap-northeast-1 \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE DELETE_FAILED \
  --query "StackSummaries[?contains(StackName,'amplify-')].StackName" --output table
aws cloudformation delete-stack --stack-name <backend-root-stack> --region ap-northeast-1
```

最後に **オーファンが無いか**確認（課金対象が残っていないか）：

```bash
aws amplify list-apps --region ap-northeast-1 --query 'apps[].appId'   # 空ならOK
aws cloudformation list-stacks --region ap-northeast-1 \
  --query "StackSummaries[?contains(StackName,'amplify-') && StackStatus!='DELETE_COMPLETE'].{name:StackName,status:StackStatus}" --output table
aws dynamodb list-tables --region ap-northeast-1        # Todo-* が残っていないか
aws cognito-idp list-user-pools --max-results 20 --region ap-northeast-1
```
