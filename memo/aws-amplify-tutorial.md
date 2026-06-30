# AWS Amplify Gen 2 チュートリアル メモ



そして肝心のデプロイコマンドは、**`cdk deploy` ではなく `npx ampx` 系のコマンド**を使う。


## 全体像：2つの「デプロイ」がある

Amplify Gen 2 には性質の違う2つのデプロイがある。ここを混同しがちなので先に押さえる。

| | コマンド | 用途 | Python的に言うと |
|---|---|---|---|
| **サンドボックス** | `npx ampx sandbox` | 自分専用の検証環境。ローカル開発中ずっと起動しておく | `flask run`（開発サーバー） |
| **本番デプロイ** | Git に push → Amplify Hosting が自動ビルド | 本番公開 | 本番サーバーへのデプロイ |

> クラウドサンドボックスは「アプリのバックエンドにとっての localhost 相当」と考える。これが Gen 2 の肝。

---

## 手順：ローカル作成 → デプロイまで（コマンドベース）

### 前提（最初の1回だけ）

```bash
node -v                  # Node.js が入っているか確認
npm install -g aws-cdk   # ※Amplifyだけなら実は不要
```

AWS の認証情報をローカルに設定しておく必要がある。ローカルマシンからバックエンドの更新をデプロイするには AWS の認証情報が必要で、AWSプロファイルに `AmplifyBackendDeployFullAccess` 権限ポリシーが付いている必要がある。

### Step 1: React プロジェクトを作る


```bash
npm create vite@latest my-amplify-app -- --template react-ts
cd my-amplify-app
npm install
```

### Step 2: Amplify を追加する

`npm create amplify@latest` を実行して、プロジェクトに Amplify Gen 2 を設定する。

```bash
npm create amplify@latest
```

このコマンドを実行すると、軽量な Amplify プロジェクトが現在のプロジェクト内に scaffold（雛形生成）される。`amplify/` というフォルダができ、中に `backend.ts`、`auth/`、`data/` といった **TypeScript でバックエンドを定義するファイル** が入る。

### Step 3: サンドボックスを起動（＝ローカル開発用のデプロイ）

ここが「ローカルでのデプロイ」にあたる。**ターミナルを2つ**使う。

```bash
# ターミナル1：フロントエンドの開発サーバー
npm run dev

# ターミナル2：バックエンドのサンドボックス（並行して起動しっぱなしにする）
npx ampx sandbox
```

`npx ampx sandbox` コマンドは `npm run dev` と並行して動かす。初回は5分ほどかかる。クラウドサンドボックスのデプロイが完了すると、新しい独立した認証・データバックエンドへの接続情報が `amplify_outputs.json` ファイルに書き込まれる。

この `amplify_outputs.json` をフロント側で読み込んで接続する。Amplify クライアントライブラリはこの outputs ファイルを使って Amplify バックエンドに接続する。

### Step 4: 本番デプロイ（Git push 型）

本番公開は **コマンドではなく Git push がトリガー** になる。これが Gen 2 の設計思想。Git リポジトリを接続するだけで、コードのコミットごとにフロントエンドとバックエンドが一緒にデプロイされる。

```bash
git init
git add .
git commit -m "initial"
git push   # GitHub等へ
```

その後、Amplify コンソールで GitHub リポジトリを接続すると、以降は push するたびに自動デプロイされる。Amplify は Git コミットに基づいてアプリの最新版を自動的にデプロイする。

---

## コマンドまとめ

```bash
# 1. フロント作成
npm create vite@latest my-amplify-app -- --template react-ts
cd my-amplify-app && npm install

# 2. Amplify追加
npm create amplify@latest

# 3. ローカル開発（ターミナル2つ）
npm run dev
npx ampx sandbox

# 4. 本番化：Git pushしてコンソールでリポジトリ接続
```

---

## ポイント

`cdk deploy` が出てこないのがポイント。CDK は Amplify の内部で動いているだけで、実際に叩くのは `npx ampx sandbox`（開発）と `git push`（本番）。

CDK を直接書く場面は、「Amplify が標準で用意していない AWS サービスを追加したい」という応用段階になってからで十分。

---

## 参考リンク

- [Amplify Gen 2 Quickstart](https://docs.amplify.aws/react/start/)
- [Manual installation (React)](https://docs.amplify.aws/react/start/manual-installation/)
- [Amplify Hosting userguide](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
