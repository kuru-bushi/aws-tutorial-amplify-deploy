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

## Git に push 後のデプロイ

git push の時点ではまだ公開URLは無い。本番URLは Amplify Hosting 接続後に発行される。

1. Amplify コンソール → 「Deploy an app」→ GitHub を認可
2. リポジトリ `kuru-bushi/aws-tutorial-amplify-deploy` / ブランチ `main` を選択
3. **Monorepo にチェックし、App root に `my-amplify-app` を指定**（必須）
4. ビルド完了で `https://main.xxxxxxxx.amplifyapp.com` 形式の本番URLが発行される

> 発行後は `aws amplify list-apps --region ap-northeast-1` でも URL を確認できる。
