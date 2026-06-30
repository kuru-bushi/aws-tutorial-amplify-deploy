# memo
- このコマンドは、react.jsのプロジェクトの雛形(フロント)を作る。プロジェクトの中に aws amplifyのバックエンド用のディレクトリを作成する。
```
npm create vite@latest my-amplify-app -- --template react-ts
```

- amplify用のプロジェクト。viteのプロジェクト(フロント)の中に作成する。
```
amplify(バックエンド)の雛形を作成
$npm create amplify@latest

アプリの起動(フロンド)
$ npm run dev

アプリの起動(バックエンド)
$ npx ampx sandbox
```

- backendを
```
npx ampx sandbox
```


- 
```
npx ampx sandbox secret list

認証情報の確認
aws sts get-caller-identity
```

