
import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';
import { publicationTypes, bookTypes } from '@/types/formTypes';

export default function ResearchPage() {
  const { formData, isEditing, handleEdit, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Research Papers Published/Presented</h2>
      
      <div className="info-message">
        <strong>API Points by Type:</strong> IJ-15, NJ-10, OJ-7, IC-10, NC-8, LC-6, PN-4, OA-2<br/>
        <strong>Bonuses:</strong> Indexed +5, IF 1-2: +10, IF 2-5: +15, IF &gt;5: +25<br/>
        <strong>Joint Papers:</strong> First/Corresponding author shares 60%, others share 40%
      </div>

      {formData.publications.map((pub, index) => (
        <div key={index} className="publication-entry">
          <h4>Publication {index + 1}</h4>
          <FormField
            label="Names of All Authors (in order)"
            value={pub.authors}
            placeholder="Enter all author names in publication order"
            isEditing={isEditing[`pub-authors-${index}`]}
            onEdit={() => handleEdit(`pub-authors-${index}`)}
            onChange={(val) => handleArrayChange('publications', index, 'authors', val)}
          />
          <FormField
            label="Title and Complete Reference (IEEE Style)"
            value={pub.title}
            placeholder="Enter title"
            multiline
            isEditing={isEditing[`pub-title-${index}`]}
            onEdit={() => handleEdit(`pub-title-${index}`)}
            onChange={(val) => handleArrayChange('publications', index, 'title', val)}
          />
          <FormField
            label="Reference"
            value={pub.reference}
            placeholder="Journal/Conference name, vol, pages, year, Impact Factor"
            multiline
            isEditing={isEditing[`pub-ref-${index}`]}
            onEdit={() => handleEdit(`pub-ref-${index}`)}
            onChange={(val) => handleArrayChange('publications', index, 'reference', val)}
          />
          <FormField
            label="Type of Publication"
            value={pub.type}
            placeholder="Select publication type"
            isEditing={isEditing[`pub-type-${index}`]}
            onEdit={() => handleEdit(`pub-type-${index}`)}
            onChange={(val) => handleArrayChange('publications', index, 'type', val)}
            type="select"
            options={publicationTypes}
          />
          <FormField
            label="Self-Assessed API Score"
            value={pub.api}
            placeholder="Enter API"
            isEditing={isEditing[`pub-api-${index}`]}
            onEdit={() => handleEdit(`pub-api-${index}`)}
            onChange={(val) => handleArrayChange('publications', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('publications', index)} className="remove-button">
              Remove Publication
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayItem('publications', { authors: '', title: '', reference: '', type: '', api: '' })}
        className="add-button"
      >
        + Add Publication
      </button>

      {/* Books Section */}
      <h3 className="section-title">Books/Chapters in Books Written (Item 15)</h3>
      <div className="info-message">
        <strong>API Points:</strong> International Publisher: 50, National: 25, Local: 15 per book.<br/>
        Chapters: 20% of category. Joint books: First author 60%, others share 40%.
      </div>

      {formData.books.map((book, index) => (
        <div key={index} className="publication-entry">
          <h4>Book/Chapter {index + 1}</h4>
          <FormField
            label="Authors"
            value={book.authors}
            placeholder="Enter all author names"
            isEditing={isEditing[`book-authors-${index}`]}
            onEdit={() => handleEdit(`book-authors-${index}`)}
            onChange={(val) => handleArrayChange('books', index, 'authors', val)}
          />
          <FormField
            label="Title"
            value={book.title}
            placeholder="Enter title"
            multiline
            isEditing={isEditing[`book-title-${index}`]}
            onEdit={() => handleEdit(`book-title-${index}`)}
            onChange={(val) => handleArrayChange('books', index, 'title', val)}
          />
          <FormField
            label="Reference"
            value={book.reference}
            placeholder="Publisher, ISBN/ISSN, Year"
            multiline
            isEditing={isEditing[`book-ref-${index}`]}
            onEdit={() => handleEdit(`book-ref-${index}`)}
            onChange={(val) => handleArrayChange('books', index, 'reference', val)}
          />
          <FormField
            label="Type"
            value={book.type}
            placeholder="Select type"
            isEditing={isEditing[`book-type-${index}`]}
            onEdit={() => handleEdit(`book-type-${index}`)}
            onChange={(val) => handleArrayChange('books', index, 'type', val)}
            type="select"
            options={bookTypes}
          />
          <FormField
            label="Self-Assessed API Score"
            value={book.api}
            placeholder="Enter API"
            isEditing={isEditing[`book-api-${index}`]}
            onEdit={() => handleEdit(`book-api-${index}`)}
            onChange={(val) => handleArrayChange('books', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('books', index)} className="remove-button">
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayItem('books', { authors: '', title: '', reference: '', type: '', api: '' })}
        className="add-button"
      >
        + Add Book/Chapter
      </button>
    </div>
  );
}
