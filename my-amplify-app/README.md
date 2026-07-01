# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

## 初回コミットとpush

本番デプロイ（Amplify Hosting + GitHub 連携）に向けて GitHub へ push する手順。

> **リポジトリ構成（実態）**
> Git リポジトリのルートは **`0_TutorialDeploy/`**（モノレポ構成）。アプリ本体 `my-amplify-app/` はそのサブフォルダ。
> 下記コマンドはすべて **`0_TutorialDeploy/` ディレクトリ**で実行する。
> Amplify Hosting 接続時は **App root に `my-amplify-app` を指定**すること（モノレポ扱い）。

実際のリモート: `https://github.com/kuru-bushi/aws-tutorial-amplify-deploy`

```bash
# 0. リポジトリ初期化（0_TutorialDeploy で実行）
git init

# 1. ブランチ名を main に（古い git では master になるため）
git branch -M main

# 2. 何がステージされるか事前確認（node_modules や amplify_outputs.json が
#    含まれていないことを必ずチェック）
git status

# 3. 全ファイルをステージ
git add -A

# 4. ステージ内容を最終確認（ファイル名だけ一覧）
git diff --cached --name-only

# 5. 初回コミット
git commit -m "chore: Amplify Gen 2 Todo アプリ 初期コミット"

# 6. GitHub に空のリポジトリ（README/.gitignore/license なし）を作成後、
#    リモート登録して push
git remote add origin https://github.com/kuru-bushi/aws-tutorial-amplify-deploy.git
git push -u origin main
```

2回目以降の更新は `git add` → `git commit` → `git push` だけでよい。

### 確認ポイント（重要）

ステージ確認時に、以下が **コミット対象に含まれていない**ことを必ず確認する（`.gitignore` で除外済み）。

- `node_modules/`
- `amplify_outputs.json` … Amplify Hosting (Gen 2) がビルド時に自動生成するためコミットしない
- `.amplify/`

> AWS アクセスキー / アカウント ID / ARN / トークン等の機密情報をコミットしないこと。

### よくあるエラー

- `error: remote origin already exists` … origin は既に登録済み。URL を変えたいときは `git remote set-url origin <URL>` を使う。
- `remote: Repository not found` … GitHub 上にリポジトリが未作成、またはリポジトリ名のタイポ／認証未設定。GitHub でリポジトリを作成してから再 push する。

## デプロイ前チェック（必須・push する前に必ず実施）

AWS の計算リソースとビルド時間には限りがある。**push してから AWS で失敗して気づくのは非効率**なので、**必ずローカルで本番と同じビルドを通してから push する。**

```bash
cd my-amplify-app
npm run build   # tsc -b && vite build（＝ Amplify のビルドと同じ内容）
```

- **成功（`dist/` が生成される）→ push してよい。** AWS でも通る可能性が高い。
- **失敗 → 直してから push。** その場で原因が分かり、AWS のビルド枠を消費しない。

> ⚠️ **`npm run dev`（Vite）は型チェックをしない**ため、型エラーがあってもローカルでは動いてしまう。
> AWS のビルドは `tsc -b` を走らせるので、**型エラーは `npm run build` でしか事前に検出できない**。
> （実際にこのプロジェクトでは、dev では動くが `tsc` で `App.tsx` の型エラーが出てデプロイが失敗した。）

Node/npm のバージョン差でも失敗するため、下記「ビルド環境の注意」も合わせて守ること。

## Git に push 後のデプロイ

git push の時点ではまだ公開URLは無い。本番URLは Amplify Hosting 接続後に発行される。

1. Amplify コンソール → 「Deploy an app」→ GitHub を認可
2. リポジトリ `kuru-bushi/aws-tutorial-amplify-deploy` / ブランチ `main` を選択
3. **Monorepo にチェックし、App root に `my-amplify-app` を指定**（必須）
4. ビルド完了で `https://main.xxxxxxxx.amplifyapp.com` 形式の本番URLが発行される

> 発行後は `aws amplify list-apps --region ap-northeast-1` でも URL を確認できる。

### ビルド環境の注意（Node/npm バージョンを AWS と一致させる）

**ローカルと AWS Amplify の Node / npm バージョンは一致させること。** バージョンが違うと依存解決の結果がズレ、`package-lock.json` が非同期になって `npm ci`（Amplify のビルド）が失敗する原因になる。

- `.nvmrc`（例: `20`）で Node バージョンを固定する
- `package.json` の `engines`（例: `"node": ">=20 <21"`）で使用バージョンを明示する
- Amplify コンソールの Build image の Node バージョンをローカルと合わせる
- lock が非同期になったら `npm install` で同期し直し、`package-lock.json` をコミットする

## デプロイ失敗時のログ解析（ログが大きいとき）

Amplify のビルドログは数百〜数千行と大きい。**ターミナルに全部流すと読めない**ので、**一旦 `tmp.txt` などのファイルに書き出してから、少しずつ `grep`／`tail` で該当箇所を絞り込む。**

### ローカル CLI でビルドログを取得する

事前に IAM ユーザーへ `amplify:ListJobs` / `amplify:GetJob`（必要なら `amplify:ListBranches`）を付与しておく。

```bash
APP=<app-id>; REGION=ap-northeast-1

# 1. 失敗ジョブの jobId を調べる
aws amplify list-jobs --app-id $APP --branch-name main --region $REGION --max-items 3 \
  --query "jobSummaries[].{jobId:jobId,status:status}" --output table

# 2. BUILD ステップの logUrl（S3署名付きURL）を取得
URL=$(aws amplify get-job --app-id $APP --branch-name main --job-id <JOB_ID> --region $REGION \
  --query "job.steps[?stepName=='BUILD'].logUrl | [0]" --output text)

# 3. ログを丸ごとファイルに保存（ターミナルに流さない）
curl -s "$URL" -o tmp.txt

# 4. ファイルから必要な行だけ抽出して解析
grep -nEi 'error|fail|exit code|TS[0-9]{3,}' tmp.txt | tail -30   # エラー行だけ
tail -40 tmp.txt                                                  # 末尾（失敗理由が出やすい）
```

### バックエンド（CloudFormation）の失敗を見るとき

フロントのビルドログとは別。バックエンド（`ampx pipeline-deploy`）の失敗は CloudFormation 側を見る。

```bash
aws cloudformation describe-stack-events --stack-name <branch-stack-name> --region ap-northeast-1 \
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED'].{time:Timestamp,type:ResourceType,reason:ResourceStatusReason}" \
  --output table
```

> 大きいログをそのまま貼り付け・出力すると解析しづらい。**「ファイルに落とす → grep で絞る → 該当箇所だけ読む」** を徹底する。
