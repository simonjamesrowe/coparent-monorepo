## Database query best practices

- **Prevent Injection Attacks**: Always use ODM/ORM query APIs (Mongoose/Prisma/Drizzle/Knex) or parameterized queries; never interpolate user input into query strings or objects
- **Avoid N+1 Queries**: Use joins, eager loading, or aggregations to fetch related data in a single query instead of multiple round trips
- **Select Only Needed Fields**: Use projections/selects to return only required fields
- **Index Strategic Fields**: Index fields used in filters, sorts, and lookups for query optimization
- **Use Transactions for Related Changes**: Wrap related database operations in transactions to maintain data consistency
- **Set Query Timeouts**: Implement timeouts to prevent runaway queries from impacting system performance
- **Cache Expensive Queries**: Cache results of complex aggregations or frequently-run queries when appropriate
