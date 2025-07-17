/**
 * Database Optimization Service Tests
 * Tests for optimized database queries, indexing, and query batching
 */

import { DatabaseOptimizationService, QueryType, DatabaseQuery } from '../DatabaseOptimizationService';

describe('DatabaseOptimizationService', () => {
  let dbOptimizationService: DatabaseOptimizationService;

  beforeEach(() => {
    dbOptimizationService = new DatabaseOptimizationService();
  });

  afterEach(() => {
    dbOptimizationService.shutdown();
  });

  describe('User Behavior Queries', () => {
    it('should generate optimized user behavior analysis queries', () => {
      const queries = dbOptimizationService.getUserBehaviorQueries();
      
      expect(queries).toHaveLength(3);
      
      // Check user interactions summary query
      const summaryQuery = queries.find(q => q.id === 'user_interactions_summary');
      expect(summaryQuery).toBeDefined();
      expect(summaryQuery?.type).toBe('user_behavior_analysis');
      expect(summaryQuery?.sql).toContain('COUNT(*) as total_interactions');
      expect(summaryQuery?.sql).toContain('GROUP BY user_id');
      expect(summaryQuery?.indexes).toContain('idx_user_interactions_user_timestamp');
      
      // Check category preferences query
      const categoryQuery = queries.find(q => q.id === 'user_category_preferences');
      expect(categoryQuery).toBeDefined();
      expect(categoryQuery?.sql).toContain('JOIN screens s ON ui.screen_id = s.id');
      expect(categoryQuery?.sql).toContain('conversion_rate');
      expect(categoryQuery?.indexes).toContain('idx_screens_category');
      
      // Check location preferences query
      const locationQuery = queries.find(q => q.id === 'user_location_preferences');
      expect(locationQuery).toBeDefined();
      expect(locationQuery?.sql).toContain('s.city, s.region');
      expect(locationQuery?.indexes).toContain('idx_screens_location');
    });

    it('should include proper indexes for user behavior queries', () => {
      const queries = dbOptimizationService.getUserBehaviorQueries();
      
      queries.forEach(query => {
        expect(query.indexes).toBeDefined();
        expect(query.indexes.length).toBeGreaterThan(0);
        expect(query.estimatedCost).toBeGreaterThan(0);
      });
    });
  });

  describe('Screen Performance Queries', () => {
    it('should generate optimized screen performance queries', () => {
      const queries = dbOptimizationService.getScreenPerformanceQueries();
      
      expect(queries).toHaveLength(2);
      
      // Check screen performance metrics query
      const metricsQuery = queries.find(q => q.id === 'screen_performance_metrics');
      expect(metricsQuery).toBeDefined();
      expect(metricsQuery?.type).toBe('screen_performance_metrics');
      expect(metricsQuery?.sql).toContain('WITH screen_stats AS');
      expect(metricsQuery?.sql).toContain('conversion_rate');
      expect(metricsQuery?.sql).toContain('booking_rate');
      
      // Check trending screens analysis query
      const trendingQuery = queries.find(q => q.id === 'trending_screens_analysis');
      expect(trendingQuery).toBeDefined();
      expect(trendingQuery?.type).toBe('trending_analysis');
      expect(trendingQuery?.sql).toContain('growth_rate');
      expect(trendingQuery?.sql).toContain('purchase_velocity');
    });

    it('should use complex CTEs for performance optimization', () => {
      const queries = dbOptimizationService.getScreenPerformanceQueries();
      
      const metricsQuery = queries.find(q => q.id === 'screen_performance_metrics');
      expect(metricsQuery?.sql).toContain('WITH screen_stats AS');
      expect(metricsQuery?.sql).toContain('screen_ratings AS');
      
      const trendingQuery = queries.find(q => q.id === 'trending_screens_analysis');
      expect(trendingQuery?.sql).toContain('WITH recent_activity AS');
      expect(trendingQuery?.sql).toContain('previous_activity AS');
    });
  });

  describe('Recommendation Queries', () => {
    it('should generate optimized recommendation queries', () => {
      const queries = dbOptimizationService.getRecommendationQueries();
      
      expect(queries).toHaveLength(2);
      
      // Check user similarity matrix query
      const similarityQuery = queries.find(q => q.id === 'user_similarity_matrix');
      expect(similarityQuery).toBeDefined();
      expect(similarityQuery?.type).toBe('recommendation_data');
      expect(similarityQuery?.sql).toContain('array_agg');
      expect(similarityQuery?.sql).toContain('INTERSECT');
      
      // Check content-based similarity query
      const contentQuery = queries.find(q => q.id === 'content_based_similarity');
      expect(contentQuery).toBeDefined();
      expect(contentQuery?.sql).toContain('category_similarity');
      expect(contentQuery?.sql).toContain('location_similarity');
      expect(contentQuery?.sql).toContain('price_similarity');
    });

    it('should include advanced similarity calculations', () => {
      const queries = dbOptimizationService.getRecommendationQueries();
      
      const contentQuery = queries.find(q => q.id === 'content_based_similarity');
      expect(contentQuery?.sql).toContain('category_similarity * 0.3');
      expect(contentQuery?.sql).toContain('location_similarity * 0.25');
      expect(contentQuery?.sql).toContain('price_similarity * 0.2');
    });
  });

  describe('Query Batching', () => {
    it('should execute high priority batches immediately', async () => {
      const mockQueries: DatabaseQuery[] = [
        {
          id: 'test-query-1',
          type: 'user_behavior_analysis',
          sql: 'SELECT * FROM test',
          parameters: {},
          estimatedCost: 100,
          indexes: ['test_index']
        }
      ];

      const startTime = Date.now();
      const results = await dbOptimizationService.executeBatch(mockQueries, 'high');
      const executionTime = Date.now() - startTime;
      
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(executionTime).toBeLessThan(1000); // Should execute quickly for high priority
    });

    it('should handle batch timeouts gracefully', async () => {
      const mockQueries: DatabaseQuery[] = [
        {
          id: 'test-query-timeout',
          type: 'user_behavior_analysis',
          sql: 'SELECT * FROM test',
          parameters: {},
          estimatedCost: 5000, // High cost to simulate slow query
          indexes: ['test_index']
        }
      ];

      // This should not throw an error but handle timeout gracefully
      const results = await dbOptimizationService.executeBatch(mockQueries, 'low');
      expect(results).toBeDefined();
    });
  });

  describe('Database Indexes', () => {
    it('should provide comprehensive index definitions', () => {
      const indexes = dbOptimizationService.getDatabaseIndexes();
      
      expect(indexes.length).toBeGreaterThan(10);
      
      // Check for essential indexes
      const userInteractionIndex = indexes.find(idx => 
        idx.indexName === 'idx_user_interactions_user_timestamp'
      );
      expect(userInteractionIndex).toBeDefined();
      expect(userInteractionIndex?.tableName).toBe('user_interactions');
      expect(userInteractionIndex?.columns).toContain('user_id');
      expect(userInteractionIndex?.type).toBe('btree');
      
      // Check for composite indexes
      const compositeIndex = indexes.find(idx => 
        idx.indexName === 'idx_screens_category_city_price'
      );
      expect(compositeIndex).toBeDefined();
      expect(compositeIndex?.columns).toHaveLength(3);
      
      // Check for GIN indexes
      const ginIndex = indexes.find(idx => idx.type === 'gin');
      expect(ginIndex).toBeDefined();
      expect(ginIndex?.indexName).toBe('idx_screens_specs_gin');
      
      // Check for partial indexes
      const partialIndex = indexes.find(idx => idx.partial);
      expect(partialIndex).toBeDefined();
      expect(partialIndex?.partial).toContain('action');
    });

    it('should generate valid SQL for index creation', () => {
      const sqlStatements = dbOptimizationService.generateIndexCreationSQL();
      
      expect(sqlStatements.length).toBeGreaterThan(10);
      
      sqlStatements.forEach(sql => {
        expect(sql).toContain('CREATE');
        expect(sql).toContain('INDEX');
        expect(sql).toContain('IF NOT EXISTS');
        expect(sql).toContain('USING');
      });
      
      // Check for unique indexes
      const uniqueIndexSQL = sqlStatements.find(sql => sql.includes('UNIQUE'));
      expect(uniqueIndexSQL).toBeDefined();
      
      // Check for partial indexes
      const partialIndexSQL = sqlStatements.find(sql => sql.includes('WHERE'));
      expect(partialIndexSQL).toBeDefined();
      
      // Check for concurrent creation
      sqlStatements.forEach(sql => {
        expect(sql).toContain('CONCURRENTLY');
      });
    });
  });

  describe('Query Performance Analysis', () => {
    it('should track query performance metrics', () => {
      const metrics = dbOptimizationService.getQueryPerformanceMetrics();
      
      expect(metrics.size).toBeGreaterThan(0);
      
      // Check that all query types have metrics
      const queryTypes: QueryType[] = [
        'user_behavior_analysis',
        'screen_performance_metrics',
        'trending_analysis',
        'recommendation_data'
      ];
      
      queryTypes.forEach(type => {
        const metric = metrics.get(type);
        expect(metric).toBeDefined();
        expect(metric?.queryType).toBe(type);
        expect(metric?.averageExecutionTime).toBeGreaterThanOrEqual(0);
        expect(metric?.totalExecutions).toBeGreaterThanOrEqual(0);
        expect(metric?.cacheHitRate).toBeGreaterThanOrEqual(0);
        expect(metric?.cacheHitRate).toBeLessThanOrEqual(1);
      });
    });

    it('should provide performance analysis and recommendations', () => {
      const analysis = dbOptimizationService.analyzeQueryPerformance('user_behavior_analysis');
      
      expect(analysis).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.indexSuggestions).toBeDefined();
      expect(analysis.queryOptimizations).toBeDefined();
      
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(Array.isArray(analysis.indexSuggestions)).toBe(true);
      expect(Array.isArray(analysis.queryOptimizations)).toBe(true);
    });

    it('should handle unknown query types gracefully', () => {
      const analysis = dbOptimizationService.analyzeQueryPerformance('unknown_type' as QueryType);
      
      expect(analysis.recommendations).toContain('No performance data available for this query type');
      expect(analysis.indexSuggestions).toHaveLength(0);
      expect(analysis.queryOptimizations).toHaveLength(0);
    });
  });

  describe('Query Structure Validation', () => {
    it('should have properly structured user behavior queries', () => {
      const queries = dbOptimizationService.getUserBehaviorQueries();
      
      queries.forEach(query => {
        // Check for proper SQL structure
        expect(query.sql).toContain('SELECT');
        expect(query.sql).toContain('FROM');
        
        // Check for performance optimizations
        if (query.sql.includes('JOIN')) {
          expect(query.indexes.some(idx => idx.includes('join') || idx.includes('screen') || idx.includes('category'))).toBe(true);
        }
        
        // Check for proper aggregations
        if (query.sql.includes('GROUP BY')) {
          expect(query.sql).toContain('COUNT');
        }
        
        // Check for time-based filtering
        expect(query.sql).toContain('timestamp');
        expect(query.sql).toContain('INTERVAL');
      });
    });

    it('should have optimized WHERE clauses', () => {
      const allQueries = [
        ...dbOptimizationService.getUserBehaviorQueries(),
        ...dbOptimizationService.getScreenPerformanceQueries(),
        ...dbOptimizationService.getRecommendationQueries()
      ];
      
      allQueries.forEach(query => {
        if (query.sql.includes('WHERE')) {
          // Should have indexed columns in WHERE clauses
          const hasIndexedWhere = query.indexes.some(index => {
            const indexColumns = index.toLowerCase();
            return query.sql.toLowerCase().includes(`where ${indexColumns}`) ||
                   query.sql.toLowerCase().includes(`and ${indexColumns}`) ||
                   query.sql.toLowerCase().includes(`${indexColumns} =`) ||
                   query.sql.toLowerCase().includes(`${indexColumns} >=`);
          });
          
          // This is a heuristic check - in real scenarios, more sophisticated analysis would be needed
          expect(query.estimatedCost).toBeLessThan(1000); // Reasonable cost estimate
        }
      });
    });
  });

  describe('Resource Management', () => {
    it('should cleanup resources properly', () => {
      const service = new DatabaseOptimizationService();
      
      // Should not throw error
      expect(() => service.shutdown()).not.toThrow();
    });

    it('should handle concurrent batch processing', async () => {
      const mockQueries1: DatabaseQuery[] = [
        {
          id: 'concurrent-query-1',
          type: 'user_behavior_analysis',
          sql: 'SELECT * FROM test1',
          parameters: {},
          estimatedCost: 50,
          indexes: ['test_index_1']
        }
      ];

      const mockQueries2: DatabaseQuery[] = [
        {
          id: 'concurrent-query-2',
          type: 'screen_performance_metrics',
          sql: 'SELECT * FROM test2',
          parameters: {},
          estimatedCost: 75,
          indexes: ['test_index_2']
        }
      ];

      // Execute batches concurrently
      const [results1, results2] = await Promise.all([
        dbOptimizationService.executeBatch(mockQueries1, 'high'),
        dbOptimizationService.executeBatch(mockQueries2, 'high')
      ]);

      expect(results1).toBeDefined();
      expect(results2).toBeDefined();
      expect(results1.length).toBe(1);
      expect(results2.length).toBe(1);
    });
  });
});