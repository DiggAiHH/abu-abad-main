
interface DocumentRequestProps {
  /** Eine optionale Liste von Dokumenten */
  documents?: Array<{ id: string; name: string; dateUploaded: string }>;
  /** Callback, wenn ein Dokument ausgewt wird */
  onSelectDocument?: (documentId: string) => void;
}

/**
 * DocumentRequests
 * 
 * Component for rendering a list of document requests. Allows user to select documents.
 */
export default function DocumentRequests({ documents = [], onSelectDocument }: DocumentRequestProps): JSX.Element {
  return (
    <div className='document-requests'>
      <h2>Document Requests</h2>
      {documents.length ? (
        <ul className='document-list'>
          {documents.map(({ id, name, dateUploaded }) => (
            <li key={id} className='document-item'>
              <span className='document-name'>{name}</span>{' '}
              <span className='document-date'>{dateUploaded}</span>
              <button
                onClick={() => onSelectDocument?.(id)}
                className='button primary'
              >
                Request Document
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No documents available.</p>
      )}
    </div>
  );
}