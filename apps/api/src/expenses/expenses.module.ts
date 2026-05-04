import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Account, AccountSchema } from '../schemas/account.schema';
import { ExpenseCategory, ExpenseCategorySchema } from '../schemas/expense-category.schema';
import {
  CsvMappingTemplate,
  CsvMappingTemplateSchema,
} from '../schemas/csv-mapping-template.schema';
import { Statement, StatementSchema } from '../schemas/statement.schema';
import { StatementLine, StatementLineSchema } from '../schemas/statement-line.schema';
import { Budget, BudgetSchema } from '../schemas/budget.schema';
import { Expense, ExpenseSchema } from '../schemas/expense.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { Parent, ParentSchema } from '../schemas/parent.schema';
import { Child, ChildSchema } from '../schemas/child.schema';
import { AuditModule } from '../audit/audit.module';

import { AccountsController } from './controllers/accounts.controller';
import { ExpenseCategoriesController } from './controllers/expense-categories.controller';
import { CsvMappingTemplatesController } from './controllers/csv-mapping-templates.controller';
import { StatementsController } from './controllers/statements.controller';
import { ExpensesController } from './controllers/expenses.controller';
import { BudgetsController } from './controllers/budgets.controller';
import { AccountsService } from './services/accounts.service';
import { ExpenseCategoriesService } from './services/expense-categories.service';
import { CsvMappingTemplatesService } from './services/csv-mapping-templates.service';
import { StatementsService } from './services/statements.service';
import { ExpensesService } from './services/expenses.service';
import { BudgetsService } from './services/budgets.service';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: ExpenseCategory.name, schema: ExpenseCategorySchema },
      { name: CsvMappingTemplate.name, schema: CsvMappingTemplateSchema },
      { name: Statement.name, schema: StatementSchema },
      { name: StatementLine.name, schema: StatementLineSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Parent.name, schema: ParentSchema },
      { name: Child.name, schema: ChildSchema },
    ]),
    AuditModule,
  ],
  controllers: [
    AccountsController,
    ExpenseCategoriesController,
    CsvMappingTemplatesController,
    StatementsController,
    ExpensesController,
    BudgetsController,
  ],
  providers: [
    AccountsService,
    ExpenseCategoriesService,
    CsvMappingTemplatesService,
    StatementsService,
    ExpensesService,
    BudgetsService,
    DashboardService,
  ],
  exports: [
    AccountsService,
    ExpenseCategoriesService,
    CsvMappingTemplatesService,
    StatementsService,
    ExpensesService,
    BudgetsService,
    DashboardService,
  ],
})
export class ExpensesModule {}
