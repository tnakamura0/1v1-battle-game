---
name: new-issue-feature
description: 機能要望Issueを既定のテンプレートに沿って作成する。ユーザーが新機能の提案や機能要望Issueの作成を依頼したときに使用する。
argument-hint: "[提案する機能の概要]"
---

以下のテンプレートに沿って、機能要望Issueを作成してください。

提案する機能: $ARGUMENTS

## Issue本文テンプレート

```markdown
## 背景・課題


## 提案内容


## 受け入れ条件
- [ ]

## 検討した代替案


## 優先度・影響範囲
- 優先度: 高/中/低
- 影響を受けるユーザー/機能:

## 補足

```

作成後、`gh issue create --title "[Feature] <概要>" --body "<本文>" --label enhancement` を実行してください。
