export class User {

  private constructor() {

  }

  static load(): User {
    return new User();
  }

}
