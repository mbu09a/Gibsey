import React, { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import {
  Action,
  Role,
  Context as GlyphContext,
  State,
  Modality,
  Relation,
  Polarity,
  Rotation,
} from '../../../packages/utils/glyphCodec';
import RoleBadge from './RoleBadge';
import { roleStyles } from '../utils/roleStyles'; // For keyof typeof roleStyles mapping

// Define a more specific type for QDPI move if available from backend types
// For now, using 'any' as a placeholder for the move object structure
type QdpiMove = {
  id: number;
  timestamp: string | number | Date; // Assuming timestamp can be a string, number, or Date
  numericGlyph: number;
  action: Action;
  role: Role;
  context: GlyphContext;
  state: State;
  modality: Modality;
  relation: Relation;
  polarity: Polarity;
  rotation: Rotation;
  operationDetails?: string | null;
  userId?: string | null;
};

export interface QdpiLogDisplayProps {
  // Props can be added later if needed, e.g., default filters or limits
}

const QdpiLogDisplay: React.FC<QdpiLogDisplayProps> = () => {
  const [selectedAction, setSelectedAction] = useState<Action | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const queryFilter: any = {};
  if (selectedAction !== undefined) queryFilter.action = selectedAction;
  if (selectedRole !== undefined) queryFilter.role = selectedRole;
  if (filterUserId.trim() !== '') queryFilter.userId = filterUserId.trim();

  const { data: queryResult, isLoading, error, refetch } = trpc.getQdpiMoves.useQuery(
    {
      filter: Object.keys(queryFilter).length > 0 ? queryFilter : undefined,
      limit,
      offset,
    },
    { keepPreviousData: true }
  );

  const qdpiMoves: QdpiMove[] = queryResult as QdpiMove[] || [];

  // Helper to get the string key for roleStyles from the Role enum value
  const getRoleStyleKey = (roleValue: Role): keyof typeof roleStyles => {
    const roleName = Role[roleValue]; // e.g., Role[0] -> "Human"
    return roleName?.toLowerCase() as keyof typeof roleStyles; // "human"
  };
  
  // Reset offset when filters change to avoid being on a non-existent page
  useEffect(() => {
    setOffset(0);
  }, [selectedAction, selectedRole, filterUserId]);

  return (
    <div className="p-4 space-y-4 bg-gray-900 text-gray-100 border border-gray-700 rounded">
      <h2 className="text-xl font-semibold">QDPI Log Viewer</h2>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-gray-700 rounded">
        <div>
          <label htmlFor="action-filter" className="block text-sm font-medium text-gray-300">Action:</label>
          <select
            id="action-filter"
            onChange={(e) => setSelectedAction(e.target.value ? Number(e.target.value) as Action : undefined)}
            value={selectedAction ?? ''}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Actions</option>
            {Object.entries(Action)
              .filter(([key, value]) => typeof value === 'number')
              .map(([key, value]) => (
                <option key={key} value={value as number}>{key}</option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-300">Role:</label>
          <select
            id="role-filter"
            onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) as Role : undefined)}
            value={selectedRole ?? ''}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Roles</option>
            {Object.entries(Role)
              .filter(([key, value]) => typeof value === 'number')
              .map(([key, value]) => (
                <option key={key} value={value as number}>{key}</option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="userid-filter" className="block text-sm font-medium text-gray-300">User ID:</label>
          <input
            id="userid-filter"
            type="text"
            placeholder="Filter by User ID"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-600 bg-gray-800 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="mt-1 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Log'}
          </button>
        </div>
      </div>

      {/* Log Display Section */}
      {isLoading && <p className="text-center">Loading log entries...</p>}
      {error && <p className="text-center text-red-500">Error loading log: {error.message}</p>}
      
      {!isLoading && !error && qdpiMoves.length === 0 && (
        <p className="text-center py-4">No log entries found for the current filters.</p>
      )}

      {!isLoading && !error && qdpiMoves.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Glyph (Hex)</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Context</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">State</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Modality</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {qdpiMoves.map((move) => (
                <tr key={move.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400">{new Date(move.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400 font-mono">{move.numericGlyph.toString(16).toUpperCase().padStart(5, '0')}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400">{Action[move.action]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <RoleBadge role={getRoleStyleKey(move.role)} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400">{GlyphContext[move.context]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400">{State[move.state]}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400">{Modality[move.modality]}</td>
                  <td className="px-3 py-2 text-xs text-gray-400 break-all max-w-xs truncate" title={move.operationDetails ?? undefined}>{move.operationDetails ?? 'N/A'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400">{move.userId ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Section */}
      {!isLoading && !error && qdpiMoves.length > 0 && (
         <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {Math.floor(offset / limit) + 1}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={!qdpiMoves || qdpiMoves.length < limit || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QdpiLogDisplay;
