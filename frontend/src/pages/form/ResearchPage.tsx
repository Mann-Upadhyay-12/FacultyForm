import { ApiField, FormField } from '@/components/assesment/FormField';
import { PointsBadge, RepeatableList, SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext } from '@/context/FormContext';
import { suggestBook, suggestPublication } from '@/lib/scoring';
import {
  authorRoleOptions,
  bookKindOptions,
  bookTypes,
  impactFactorOptions,
  indexingOptions,
  publicationTypes,
  templates,
} from '@/types/formTypes';

export default function ResearchPage() {
  const { apiScores } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Research Papers & Books</h2>
      <p className="subtitle">Items 14 – 15. Any standard citation style is fine (APA, MLA, Chicago, IEEE).</p>

      <div className="info-message">
        <strong>Points by type:</strong> IJ 15, NJ 10, OJ 7, IC 10, NC 8, LC 6, PN 4, OA 2
        <br />
        <strong>Bonuses:</strong> Indexed (Scopus / WoS / UGC-CARE …) +5 · IF 1–2 +10 · IF 2–5 +15 · IF &gt;5 +25
        <br />
        <strong>Joint papers:</strong> first / corresponding author gets 60%, the other authors share 40%.
      </div>

      <RepeatableList name="publications" template={templates.publications} itemLabel="Publication" badge={(r) => <PointsBadge value={r.api} />}>
        {(p, _i, set) => (
          <>
            <FormField label="Title of the paper" type="textarea" value={p.title} placeholder="Full title" onChange={(v) => set('title', v)} />
            <FormField label="All authors (in order)" value={p.authors} placeholder="e.g., A. Sharma, R. Verma, K. Singh" onChange={(v) => set('authors', v)} wide />
            <FormField
              label="Journal / conference, vol., issue, pages, year, DOI"
              type="textarea"
              value={p.reference}
              placeholder="e.g., Economic & Political Weekly, 59(12), 45–52, 2025. doi:…"
              onChange={(v) => set('reference', v)}
            />
            <FormField label="Type of publication" type="select" value={p.type} options={publicationTypes} onChange={(v) => set('type', v)} />
            <FormField label="Indexing" type="select" value={p.indexing} options={indexingOptions} onChange={(v) => set('indexing', v)} />
            <FormField label="Impact factor" type="select" value={p.impactFactor} options={impactFactorOptions} onChange={(v) => set('impactFactor', v)} />
            <FormField label="Your authorship" type="select" value={p.authorRole} options={authorRoleOptions} onChange={(v) => set('authorRole', v)} />
            <FormField label="Total number of authors" type="number" min={1} step={1} value={p.authorCount} placeholder="e.g., 3" onChange={(v) => set('authorCount', v)} />
            <ApiField value={p.api} onChange={(v) => set('api', v)} suggested={suggestPublication(p)} />
          </>
        )}
      </RepeatableList>

      <SectionTotal label="Item 14 total" claimed={apiScores.byKey.publications.claimed} />

      <h3 className="section-title">Books / chapters in books (item 15)</h3>
      <div className="info-message">
        <strong>Points per book:</strong> International publisher 50, National 25, Local 15. Chapters: 20% of the book’s category.
        <br />
        Joint books: first author 60%, others share 40%. Edited volumes and translations are scored by the committee — enter your claim.
      </div>

      <RepeatableList name="books" template={templates.books} itemLabel="Book / chapter" badge={(r) => <PointsBadge value={r.api} />}>
        {(b, _i, set) => (
          <>
            <FormField label="Title (and chapter title, if a chapter)" type="textarea" value={b.title} placeholder="Title" onChange={(v) => set('title', v)} />
            <FormField label="Authors / editors" value={b.authors} placeholder="All names in order" onChange={(v) => set('authors', v)} wide />
            <FormField label="Publisher, ISBN / ISSN, year" type="textarea" value={b.reference} placeholder="e.g., Routledge, ISBN 978-…, 2025" onChange={(v) => set('reference', v)} />
            <FormField label="Kind" type="select" value={b.kind} options={bookKindOptions} onChange={(v) => set('kind', v)} />
            <FormField label="Publisher category" type="select" value={b.type} options={bookTypes} onChange={(v) => set('type', v)} />
            <FormField label="Your authorship" type="select" value={b.authorRole} options={authorRoleOptions} onChange={(v) => set('authorRole', v)} />
            <FormField label="Total number of authors" type="number" min={1} step={1} value={b.authorCount} placeholder="e.g., 2" onChange={(v) => set('authorCount', v)} />
            <ApiField value={b.api} onChange={(v) => set('api', v)} suggested={suggestBook(b)} />
          </>
        )}
      </RepeatableList>

      <SectionTotal label="Item 15 total" claimed={apiScores.byKey.books.claimed} />
    </div>
  );
}
