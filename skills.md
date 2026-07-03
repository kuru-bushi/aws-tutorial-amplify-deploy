---
name: amplify-deploy
description: AWS Amplify Gen 2 アプリ（React + Vite + TypeScript フロント／Amplify Hosting の GitHub 連携 CI/CD）を 0 から作ってデプロイし、デプロイ後の修正を再デプロイする手順とチェック。ビルド失敗の切り分けにも使う。Amplify・ampx・amplify.yml・pipeline-deploy・sandbox・「デプロイ」「本番反映」「ビルドが通らない」等に触れたら、明示的に頼まれていなくても必ずこのスキルを参照すること。
---

# skills.md — AWS デプロイ実践知（Amplify Gen 2）

対象スタック: React + Vite + TypeScript フロント / Amplify Gen 2 バックエンド / Amplify Hosting（GitHub 連携 CI/CD）。

**鉄則: push 前に `cd my-amplify-app && rm -rf node_modules && npm ci && npm run build` が通ること。**
これがクラウドのビルドと同じ処理で、通れば本番でもほぼ通る。無駄なデプロイの大半が消える。
（`npm run dev` は型チェックしない・`npm install` は lock を勝手に直すので、どちらも当てにならない）

---

## フォルダ構成

```
0_TutorialDeploy/                  # リポジトリのルート（Amplify の appRoot ではない）
├── amplify.yml                    # ★ ビルド定義。appRoot: my-amplify-app を指定
├── package*.json                  #   ルート側の依存（クラウドは見ない）
└── my-amplify-app/                # ★ アプリ本体＝appRoot（クラウドが見る場所）
    ├── amplify/                   # ★ バックエンド定義（backend.ts / auth / data）
    ├── src/                       # ★ フロント（main.tsx で Amplify.configure、App.tsx が画面）
    ├── package*.json              # ★ クラウドが npm ci で見る依存
    ├── tsconfig*.json             #   build 時の tsc が参照
    ├── amplify_outputs.json       # ← sandbox 生成物（commit しない）
    ├── dist/                      # ← build 出力（commit しない）
    └── node_modules/              # ← 依存の実体（commit しない）
```

---

## 1. デプロイ前に確認すること

1. **クラウド同等ビルドを通す**（上記の鉄則コマンド）。← 最優先。
2. **`package-lock.json` を同期して commit**（`npm ci` は lock 不一致で即失敗する）。
3. **Node バージョンを固定**（`.nvmrc` か `amplify.yml`。ローカルと違うと落ちる）。
4. **機密・生成物を commit しない**（`amplify_outputs.json` / `.env` / AWS キー・ID・ARN が `.gitignore` 済みか）。
   ```bash
   git ls-files | grep -iE "amplify_outputs|\.env|credentials" || echo "OK"
   ```

### 初回デプロイ時だけ追加で見ること
初回は CI/CD 実績ゼロで設定ミスがまとめて出る。上記に加えて:

- `amplify.yml` がリポジトリルートにあり、`appRoot` が実パスと一致。`baseDirectory` がビルド出力（Vite は `dist`）と一致。
- （バックエンドを含む場合）対象リージョンで **CDK bootstrap 済み**／Amplify のサービスロールにデプロイ権限がある。→ **`npx ampx sandbox` が成功していれば OK**（認証・モデル・CDK 展開のリハーサルになる）。
- Amplify コンソールで接続するブランチ名が、push したブランチと一致。

---

## 2. 0 からデプロイするまでの手順

1. **雛形作成**: `npm create amplify@latest`（`amplify/` が作られる）
2. **バックエンド定義**: `amplify/data/resource.ts` にモデル、必要なら `amplify/auth/resource.ts`
3. **sandbox 起動**: `npx ampx sandbox` → 個人バックエンドをクラウドに立て `amplify_outputs.json` 生成（本番とは別環境）
4. **フロント配線**: `main.tsx` で `Amplify.configure(outputs)`、`App.tsx` で `generateClient()`
5. **ローカル確認**: `npm run dev` で動作確認 → **その後に必ず鉄則コマンドでビルド検証**
6. **本番デプロイ**: GitHub に push → Amplify コンソールでアプリ作成・リポジトリ/ブランチ接続 → push で自動ビルド → 成功後 `https://<ブランチ>.<app-id>.amplifyapp.com` で確認

### `amplify.yml`（モノレポ例）
```yaml
version: 1
applications:
  - appRoot: my-amplify-app
    backend:
      phases:
        build:
          commands:
            - npm ci
            - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
    frontend:
      phases:
        preBuild:
          commands: [npm ci]
        build:
          commands: [npm run build]
      artifacts:
        baseDirectory: dist
        files: ['**/*']
      cache:
        paths: [node_modules/**/*]
```

---

## 3. デプロイ後に修正して再デプロイ

対象ブランチへの **push で自動再デプロイ**（手動不要）。

```bash
# 修正 → 鉄則コマンドでビルド検証 → 通ったら push
cd my-amplify-app && rm -rf node_modules && npm ci && npm run build && cd ..
git add -A && git commit -m "fix: ..." && git push
```

ビルドは最初のエラーで止まるため、push 前に全部潰さないと「push→数分待ち→1個直す」を繰り返すことになる。

- **ログ確認**: `aws amplify list-jobs` で成否、`aws amplify get-job ... --query "job.steps[].logUrl"` でログ URL（要 `amplify:ListJobs`/`GetJob`）
- **バックエンド変更**: `amplify/` を push すると `pipeline-deploy` でバックエンドも再デプロイ。破壊的変更はデータ消失に注意（sandbox で先に検証）
- **後片付け（課金停止）**: `npx ampx sandbox delete` ＋ コンソールで本番アプリ削除
