## Database query best practices

- **Prevent Injection Attacks**: Always use ODM methods (Mongoose) or parameterized queries; never interpolate user input into query objects
- **Avoid N+1 Queries**: Use population or aggregation pipelines to fetch related data in a single query instead of multiple queries
- **Select Only Needed Fields**: Use projections to request only the fields you need rather than returning entire documents
- **Index Strategic Fields**: Index fields used in query filters, sorts, and lookups for query optimization
- **Use Transactions for Related Changes**: Wrap related database operations in transactions to maintain data consistency
- **Set Query Timeouts**: Implement timeouts to prevent runaway queries from impacting system performance
- **Cache Expensive Queries**: Cache results of complex aggregations or frequently-run queries when appropriate
