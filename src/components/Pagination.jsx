import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1 || isLoading}
      >
        &larr; Previous
      </button>
      
      <span className="page-info">
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage >= totalPages || isLoading}
      >
        Next &rarr;
      </button>
    </div>
  );
};

export default Pagination;