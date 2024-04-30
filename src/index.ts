import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  pgEnum,
  uniqueIndex,
  timestamp,
} from 'drizzle-orm/pg-core'
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { asc, desc, eq } from 'drizzle-orm'

const app = new Elysia()

app.use(cors())
app.use(
  swagger({
    path: '/v3/swagger',
    documentation: {
      info: {
        title: 'Elysia Documentation',
        version: '1.0.0',
      },
    },
  }),
)

const zones = pgTable('zones', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).default('').notNull(),
  status: varchar('status').default('1').notNull(),
  isDelete: varchar('isDelete', { length: 1 }).default('0').notNull(),
})

const diningtable = pgTable('diningtable', {
  id: serial('id'),
  name: text('name').notNull(),
  zoneId: integer('zoneId').references(() => zones.id),
  diningtableStatusId: integer('diningtableStatusId'),
  seat: integer('seat').default(0).notNull(),
  isDelete: varchar('isDelete', { length: 1 }).default('0').notNull(),
  timestamp: timestamp('timestamp').default(new Date()).notNull(),
  delete_at: timestamp('delete_at'),
})

app.get('/', () => 'Hello Elysia')
app.get('/test', async ({ set, error }) => {
  try {
    const pool: Pool = new Pool({
      host: 'bubblethailand.com',
      port: 5432,
      user: 'bubbleth_root',
      password: 'BubblecafeAbc1234$',
      database: 'dev_test',
    })

    const db = drizzle(pool)

    const startTime = new Date()
    console.log('เริ่มต้นการทำงาน:', startTime)

    const result: any[] = await db
      .select({
        id: zones.id,
        name: zones.name,
        status: zones.status,
        isDelete: zones.isDelete,
        diningtable: diningtable,
      })
      .from(zones)
      .fullJoin(diningtable, eq(diningtable.zoneId, zones.id))
      .orderBy(desc(zones.id), asc(diningtable.id))

    // คำนวณเวลาที่ใช้ไป
    const endTime = new Date()
    const elapsedTime = endTime.getTime() - startTime.getTime()
    console.log('เสร็จสิ้นการทำงาน:', endTime)
    console.log('เวลาที่ใช้ไป:', elapsedTime, 'มิลลิวินาที')

    return {
      status: set.status = 200,
      message: 'OK',
      data: result,
    }
  } catch (er) {
    error(500, er)
  }
})

app.listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
