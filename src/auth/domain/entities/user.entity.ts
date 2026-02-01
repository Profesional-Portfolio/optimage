export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static fromObject(object: {
    id: string;
    email: string;
    password?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: any;
  }): User {
    const { id, email, password, isActive, createdAt, updatedAt } = object;

    if (!id) throw new Error('User id is required');
    if (!email) throw new Error('User email is required');

    return new User(
      id,
      email,
      password,
      isActive ?? true,
      createdAt ?? new Date(),
      updatedAt ?? new Date(),
    );
  }
}
