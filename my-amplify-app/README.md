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

本番デプロイ（Amplify Hosting + GitHub 連携）に向けて、`my-amplify-app/` を単体 Git リポジトリ化して GitHub へ push する手順。すべて `my-amplify-app/` ディレクトリ内で実行する。

```bash
# 0. リポジトリ初期化
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

# 6. GitHub に空のリポジトリを作成後、リモート登録して push
#    （<your-account> / <repo-name> は自分の値に置き換える）
git remote add origin https://github.com/<your-account>/<repo-name>.git
git push -u origin main
```

### 確認ポイント（重要）

ステージ確認時に、以下が **コミット対象に含まれていない**ことを必ず確認する（`.gitignore` で除外済み）。

- `node_modules/`
- `amplify_outputs.json` … Amplify Hosting (Gen 2) がビルド時に自動生成するためコミットしない
- `.amplify/`

> AWS アクセスキー / アカウント ID / ARN / トークン等の機密情報をコミットしないこと。
