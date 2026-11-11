import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import { ArrayFieldGroup } from '../ArrayFieldGroup';
import type { FormData, Publication } from '@/types/assessment';

interface ResearchTabProps {
  formData: FormData;
  isEditing: (field: string) => boolean;
  toggleEdit: (field: string) => void;
  handleArrayChange: <T extends Record<string, unknown>>(
    arrayName: keyof FormData,
    index: number,
    field: keyof T,
    value: string
  ) => void;
  addArrayItem: <T extends Record<string, unknown>>(
    arrayName: keyof FormData,
    template: T
  ) => void;
  removeArrayItem: (arrayName: keyof FormData, index: number) => void;
}

const publicationTypes = [
  { label: 'IJ - International Journal', value: 'IJ' },
  { label: 'NJ - National Journal', value: 'NJ' },
  { label: 'OJ - Other Journal', value: 'OJ' },
  { label: 'IC - International Conference', value: 'IC' },
  { label: 'NC - National Conference', value: 'NC' },
  { label: 'LC - Local/Regional Conference', value: 'LC' },
  { label: 'PN - Presented but Not Published', value: 'PN' },
  { label: 'OA - Only Abstract Published', value: 'OA' },
];

const bookTypes = [
  { label: 'International Publisher (Peer Reviewed)', value: 'International' },
  { label: 'National Publisher with ISBN/ISSN', value: 'National' },
  { label: 'Local Publisher with ISBN/ISSN', value: 'Local' },
  { label: 'Chapter in Book', value: 'Chapter' },
];

const emptyPublication: Publication = {
  authors: '',
  title: '',
  reference: '',
  type: '',
  api: ''
};

export function ResearchTab({
  formData,
  isEditing,
  toggleEdit,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: ResearchTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Research Papers Published/Presented"
        description="Journal articles and conference papers (Item 14)"
        infoMessage="API Points: IJ-15, NJ-10, OJ-7, IC-10, NC-8, LC-6, PN-4, OA-2. Additional points for indexed journals and impact factors."
      >
        <ArrayFieldGroup<Publication>
          items={formData.publications}
          onAdd={() => addArrayItem('publications', emptyPublication)}
          onRemove={(index) => removeArrayItem('publications', index)}
          addLabel="Add Publication"
          itemLabel="Publication"
          renderItem={(pub, index) => (
            <div className="space-y-4">
              <FormField
                label="Authors (in order of publication)"
                value={pub.authors}
                placeholder="e.g., Solomon, D., Sonia, K., Kumar, K., Kanwar, K."
                isEditing={isEditing(`pub-authors-${index}`)}
                onEdit={() => toggleEdit(`pub-authors-${index}`)}
                onChange={(val) => handleArrayChange('publications', index, 'authors', val)}
                tooltip="Enter all author names in the order they appear in the publication"
              />
              <FormField
                label="Title and Complete Reference (IEEE Style)"
                value={pub.title}
                placeholder="Enter the full title of the paper"
                isEditing={isEditing(`pub-title-${index}`)}
                onEdit={() => toggleEdit(`pub-title-${index}`)}
                onChange={(val) => handleArrayChange('publications', index, 'title', val)}
                multiline
              />
              <FormField
                label="Reference Details"
                value={pub.reference}
                placeholder="Journal/Conference name, volume, pages, year, DOI, Impact Factor"
                isEditing={isEditing(`pub-ref-${index}`)}
                onEdit={() => toggleEdit(`pub-ref-${index}`)}
                onChange={(val) => handleArrayChange('publications', index, 'reference', val)}
                multiline
                tooltip="Include journal name, volume, issue, pages, year. Mention Impact Factor if applicable."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Type of Publication"
                  value={pub.type}
                  placeholder="Select type"
                  isEditing={isEditing(`pub-type-${index}`)}
                  onEdit={() => toggleEdit(`pub-type-${index}`)}
                  onChange={(val) => handleArrayChange('publications', index, 'type', val)}
                  type="select"
                  options={publicationTypes}
                />
                <FormField
                  label="Self-Assessed API Score"
                  value={pub.api}
                  placeholder="Calculate based on type and factors"
                  isEditing={isEditing(`pub-api-${index}`)}
                  onEdit={() => toggleEdit(`pub-api-${index}`)}
                  onChange={(val) => handleArrayChange('publications', index, 'api', val)}
                  type="number"
                  tooltip="Base score + bonuses for indexing and impact factor. See API scheme for details."
                />
              </div>
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title="Books/Chapters in Books Written"
        description="Authored or contributed book chapters (Item 15)"
        infoMessage="API Points: International Publisher-50, National-25, Local-15 per book. Chapters: 20% of category."
      >
        <ArrayFieldGroup<Publication>
          items={formData.books}
          onAdd={() => addArrayItem('books', emptyPublication)}
          onRemove={(index) => removeArrayItem('books', index)}
          addLabel="Add Book/Chapter"
          itemLabel="Book/Chapter"
          renderItem={(book, index) => (
            <div className="space-y-4">
              <FormField
                label="Authors"
                value={book.authors}
                placeholder="Enter all author names"
                isEditing={isEditing(`book-authors-${index}`)}
                onEdit={() => toggleEdit(`book-authors-${index}`)}
                onChange={(val) => handleArrayChange('books', index, 'authors', val)}
              />
              <FormField
                label="Title"
                value={book.title}
                placeholder="Enter book/chapter title"
                isEditing={isEditing(`book-title-${index}`)}
                onEdit={() => toggleEdit(`book-title-${index}`)}
                onChange={(val) => handleArrayChange('books', index, 'title', val)}
                multiline
              />
              <FormField
                label="Reference Details"
                value={book.reference}
                placeholder="Publisher, ISBN/ISSN, Year, Edition"
                isEditing={isEditing(`book-ref-${index}`)}
                onEdit={() => toggleEdit(`book-ref-${index}`)}
                onChange={(val) => handleArrayChange('books', index, 'reference', val)}
                multiline
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Type"
                  value={book.type}
                  placeholder="Select type"
                  isEditing={isEditing(`book-type-${index}`)}
                  onEdit={() => toggleEdit(`book-type-${index}`)}
                  onChange={(val) => handleArrayChange('books', index, 'type', val)}
                  type="select"
                  options={bookTypes}
                />
                <FormField
                  label="Self-Assessed API Score"
                  value={book.api}
                  placeholder="Enter API score"
                  isEditing={isEditing(`book-api-${index}`)}
                  onEdit={() => toggleEdit(`book-api-${index}`)}
                  onChange={(val) => handleArrayChange('books', index, 'api', val)}
                  type="number"
                />
              </div>
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}
