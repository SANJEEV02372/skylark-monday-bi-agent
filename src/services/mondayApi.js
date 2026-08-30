/**
 * Monday.com GraphQL API v2 Client & Dynamic Connector
 * Skylark Drones - Business Intelligence Agent
 * 
 * Features:
 * - Dynamic GraphQL v2 queries
 * - Column heuristic auto-mapper for custom board structures
 * - Connection validator & live board reader
 * - Seamless fallback to offline / demo data mode
 */

import { DEALS_BASELINE, WORK_ORDERS_BASELINE } from './datasets';
import { normalizeDeal, normalizeWorkOrder } from './dataResilience';

const MONDAY_API_URL = 'https://api.monday.com/v2';

export class MondayClient {
  constructor(apiToken = '', dealsBoardId = '', workOrdersBoardId = '') {
    this.apiToken = apiToken || localStorage.getItem('monday_api_token') || '';
    this.dealsBoardId = dealsBoardId || localStorage.getItem('monday_deals_board_id') || '';
    this.workOrdersBoardId = workOrdersBoardId || localStorage.getItem('monday_wo_board_id') || '';
    this.isLiveMode = Boolean(this.apiToken && (this.dealsBoardId || this.workOrdersBoardId));
  }

  setCredentials(apiToken, dealsBoardId, workOrdersBoardId) {
    this.apiToken = apiToken.trim();
    this.dealsBoardId = dealsBoardId.trim();
    this.workOrdersBoardId = workOrdersBoardId.trim();
    this.isLiveMode = Boolean(this.apiToken && (this.dealsBoardId || this.workOrdersBoardId));

    if (this.apiToken) localStorage.setItem('monday_api_token', this.apiToken);
    if (this.dealsBoardId) localStorage.setItem('monday_deals_board_id', this.dealsBoardId);
    if (this.workOrdersBoardId) localStorage.setItem('monday_wo_board_id', this.workOrdersBoardId);
  }

  clearCredentials() {
    this.apiToken = '';
    this.dealsBoardId = '';
    this.workOrdersBoardId = '';
    this.isLiveMode = false;
    localStorage.removeItem('monday_api_token');
    localStorage.removeItem('monday_deals_board_id');
    localStorage.removeItem('monday_wo_board_id');
  }

  /**
   * Execute GraphQL Query against Monday.com
   */
  async executeQuery(query, variables = {}) {
    if (!this.apiToken) {
      throw new Error('Monday.com API Token is not configured.');
    }

    const response = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiToken,
        'API-Version': '2023-10'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Monday.com API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (data.errors && data.errors.length > 0) {
      throw new Error(`GraphQL Error: ${data.errors.map(e => e.message).join(', ')}`);
    }

    return data.data;
  }

  /**
   * Test Connection with API Token & Board IDs
   */
  async testConnection(token, boardId) {
    const testToken = token || this.apiToken;
    if (!testToken) {
      return { success: false, message: 'API Token is required' };
    }

    const query = `
      query {
        me {
          id
          name
          email
        }
        ${boardId ? `boards(ids: [${boardId}]) { id name items_count }` : `boards(limit: 5) { id name items_count }`}
      }
    `;

    try {
      const res = await fetch(MONDAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': testToken,
          'API-Version': '2023-10'
        },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      if (data.errors) {
        return { success: false, message: data.errors[0]?.message || 'Failed to authenticate' };
      }

      return {
        success: true,
        user: data.data?.me,
        boards: data.data?.boards || [],
        message: `Connected successfully as ${data.data?.me?.name || 'User'}!`
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  /**
   * Fetches Board Items & parses column values dynamically
   */
  async fetchBoardItems(boardId) {
    if (!boardId || !this.apiToken) return null;

    const query = `
      query GetBoardItems($boardId: [ID!]) {
        boards(ids: $boardId) {
          id
          name
          columns {
            id
            title
            type
          }
          items_page(limit: 500) {
            cursor
            items {
              id
              name
              group {
                title
              }
              column_values {
                id
                text
                value
                type
              }
            }
          }
        }
      }
    `;

    const data = await this.executeQuery(query, { boardId: [boardId] });
    const board = data?.boards?.[0];
    if (!board) throw new Error(`Board ID ${boardId} not found.`);

    const columnsMap = {};
    board.columns.forEach(col => {
      columnsMap[col.id] = col.title;
    });

    const items = board.items_page?.items || [];
    return items.map(item => {
      const record = { id: item.id, name: item.name, group: item.group?.title };
      item.column_values.forEach(cv => {
        const title = columnsMap[cv.id] || cv.id;
        record[title] = cv.text;
      });
      return record;
    });
  }

  /**
   * Fetch Deals Data (Live API or Demo Fallback)
   */
  async getDeals() {
    if (this.isLiveMode && this.dealsBoardId) {
      try {
        const rawItems = await this.fetchBoardItems(this.dealsBoardId);
        return rawItems.map((item, idx) => normalizeDeal(item, idx));
      } catch (err) {
        console.warn('Live Deals fetch failed, falling back to cached dataset:', err.message);
      }
    }
    // Return high-fidelity baseline dataset normalized
    return DEALS_BASELINE.map((item, idx) => normalizeDeal(item, idx));
  }

  /**
   * Fetch Work Orders Data (Live API or Demo Fallback)
   */
  async getWorkOrders() {
    if (this.isLiveMode && this.workOrdersBoardId) {
      try {
        const rawItems = await this.fetchBoardItems(this.workOrdersBoardId);
        return rawItems.map((item, idx) => normalizeWorkOrder(item, idx));
      } catch (err) {
        console.warn('Live Work Orders fetch failed, falling back to cached dataset:', err.message);
      }
    }
    // Return high-fidelity baseline dataset normalized
    return WORK_ORDERS_BASELINE.map((item, idx) => normalizeWorkOrder(item, idx));
  }

  /**
   * Fetch both boards synchronously and return normalized analytical model
   */
  async fetchAllData() {
    const [deals, workOrders] = await Promise.all([
      this.getDeals(),
      this.getWorkOrders()
    ]);

    return {
      deals,
      workOrders,
      source: this.isLiveMode ? 'Live Monday.com GraphQL API v2' : 'Embedded High-Fidelity Dataset (Demo Mode)'
    };
  }
}

export const mondayService = new MondayClient();
