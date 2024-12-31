import React, { useState } from 'react';
import { parse } from 'papaparse';
import supabase from '../lib/supabase';

const ImportFromCSV = ({ user, onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    console.log('File selected:', event.target.files[0]);
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

const handleImport = async () => {
  if (!selectedFile) {
    setError('Please select a file');
    return;
  }

  console.log('Starting import process...');
  setLoading(true);

  parse(selectedFile, {
    header: false, // CSV has no headers
    transformHeader: (header) => header.toLowerCase(),
    transform: (value) => {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
      }
      return value;
    },
    complete: async (results) => {
      try {
        console.log('Parsed dates:', results.data);
        
        // Format data for comparison
        const formattedData = results.data.map(row => ({
          start_date: row[0] // Take first column
        }));
        
        console.log('Formatted data:', formattedData);

        const { data: existingDates, error: fetchError } = await supabase
          .from('dates')
          .select('start_date')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;
        
        console.log('Existing dates:', existingDates);

        const existingDateSet = new Set(
          existingDates.map(d => d.start_date)
        );

        const newDates = formattedData
          .filter(row => row.start_date && !existingDateSet.has(row.start_date))
          .map(row => ({
            start_date: row.start_date,
            user_id: user.id,
            created_at: new Date().toISOString()
          }));

        console.log('New dates to insert:', newDates);

        if (newDates.length > 0) {
          const { error: insertError } = await supabase
            .from('dates')
            .insert(newDates);

          if (insertError) throw insertError;
        }

        onImportComplete?.();
        setSelectedFile(null);
        setError(null);
      } catch (error) {
        console.error('Import error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  });
};

  return (
    <div className="import-csv">
      <h2>Import</h2>
        <p>Import your dates from a CSV file</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
        />
        <button 
          onClick={handleImport}
          disabled={!selectedFile || loading}
        >
          {loading ? 'Importing...' : 'Import CSV'}
        </button>
        {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ImportFromCSV;