import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '../../../../generated/prisma/client';
import { PrismaPromptRepository } from '@/infrastructure/repository/prisma-prompt.repository';
import { CreatePromptDTO } from '@/core/application/prompts/create-prompt.dto';
import { UpdatePromptDTO } from '@/core/application/prompts/update-prompt.dto';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: CreatePromptDTO }) => Promise<void>
  >;
  update: jest.MockedFunction<
    (args: { where: { id: string }; data: UpdatePromptDTO }) => Promise<Prompt>
  >;
  delete: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<void>
  >;
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string };
    }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
  >;
  findUnique: jest.MockedFunction<
    (args: { where: { id: string } }) => Promise<Prompt | null>
  >;
  findMany: jest.MockedFunction<
    (args: {
      orderBy?: { createdAt: 'asc' | 'desc' };
      where?: {
        OR: Array<{
          title?: { contains: string; mode: 'insensitive' };
          content?: { contains: string; mode: 'insensitive' };
        }>;
      };
    }) => Promise<Prompt[]>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repository = new PrismaPromptRepository(prisma);
  });

  describe('create', () => {
    it('should return a create method that creates a new prompt', async () => {
      const input = {
        title: 'Prompt 1',
        content: 'Content 1',
      };

      await repository.create(input);

      expect(prisma.prompt.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('update', () => {
    it('should return an update method that updates an existing prompt', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'Prompt 1',
        content: 'Content 1',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValue(input);

      const result = await repository.update(input.id, {
        title: input.title,
        content: input.content,
      });

      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: { title: input.title, content: input.content },
      });
      expect(result).toEqual(input);
    });

    it('should not include a content field in the update data if it is not provided', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'Prompt 1',
        content: '',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValue(input);

      await repository.update(input.id, { title: input.title });
      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ title: input.title });
      expect('content' in call.data).toBe(false);
    });

    it('should not include a title field in the update data if it is not provided', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: '',
        content: 'Content 1',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.update.mockResolvedValue(input);

      await repository.update(input.id, { content: input.content });
      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({ content: input.content });
      expect('title' in call.data).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return a delete method that deletes an existing prompt', async () => {
      const id = '1';
      await repository.delete(id);

      expect(prisma.prompt.delete).toHaveBeenCalledWith({
        where: { id: id },
      });
    });
  });

  describe('findByTitle', () => {
    it('should return findFirst with the title', async () => {
      const title = 'Prompt 1';
      const input = {
        id: '1',
        title,
        content: 'Content 1',
      };
      prisma.prompt.findFirst.mockResolvedValue(input);

      const result = await repository.findByTitle(title);

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: { title },
      });
      expect(result).toEqual(input);
    });
  });

  describe('findById', () => {
    it('should return a prompt if it exists', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'Prompt 1',
        content: 'Content 1',
        createdAt: now,
        updatedAt: now,
      };
      prisma.prompt.findUnique.mockResolvedValue(input);

      const result = await repository.findById(input.id);

      expect(prisma.prompt.findUnique).toHaveBeenCalledWith({
        where: { id: input.id },
      });
      expect(result).toEqual(input);
    });

    it('should return null if the prompt does not exist', async () => {
      prisma.prompt.findUnique.mockResolvedValue(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should return all prompts ordered by creation date', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '2',
          title: 'Prompt 2',
          content: 'Content 2',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.findMany();

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });

  describe('searchMany', () => {
    it('should not include a where clause when the search term is empty', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('      ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });

    it('should search by term and populate the OR clause', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('   prompt 01   ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'prompt 01', mode: 'insensitive' } },
            { content: { contains: 'prompt 01', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });
});
