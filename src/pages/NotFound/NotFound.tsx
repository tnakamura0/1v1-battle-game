import { Link } from 'react-router'
import { ctaClass } from '@/components/ctaStyle'

/**
 * どのルートにもマッチしなかったときの受け皿。
 *
 * **この画面がないと、存在しないパスは空の画面になる（Issue #154）。**
 * vercel.json でSPAフォールバックを入れた結果（Issue #150）、Vercelは
 * 存在しないパスにも index.html を返すようになった。そのため404を出すのは
 * サーバーではなくアプリの責務になり、キャッチオールが必須になっている。
 * routes/index.tsx の `path="*"` を消さないこと。
 *
 * **HTTPステータスは200のままで、404にはならない。** vercel.json の rewrite は
 * リダイレクトではなくURLを保ったまま index.html を返すので、サーバーはパスの
 * 正否を知らない。検索エンジンにこの画面を拾わせたくない場合は、Vercel側の
 * 404ルートかクライアント側の noindex が別途要る。今は画面が5つで外部からの
 * 被リンクもないため、そこまではしない。
 *
 * 導線は「トップへ戻る」1つに絞っている。ここに来た人は迷子なので、
 * 選択肢を増やすより、確実に戻れる出口を1つ置くほうが早い。
 */
export function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="font-mono text-meta font-bold tracking-[0.18em] text-accent">NOT FOUND</span>

      <h1 className="font-sans text-3xl font-extrabold text-text-primary sm:text-4xl">
        ページが見つかりません
      </h1>

      <p className="font-sans text-sm leading-relaxed text-text-secondary">
        URLが間違っているか、ページが移動した可能性があります。
      </p>

      <Link to="/" className={ctaClass('primary')}>
        トップへ戻る
      </Link>
    </main>
  )
}
