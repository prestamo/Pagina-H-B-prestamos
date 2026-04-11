import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Base de datos y servidor activos
  private selectedDbSubject = new BehaviorSubject<string>('BDRepuesto');
  public selectedDb$ = this.selectedDbSubject.asObservable();

  private selectedServerSubject = new BehaviorSubject<string>('YERY-PEREZ');
  public selectedServer$ = this.selectedServerSubject.asObservable();

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('techsystem_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
    const savedDb = localStorage.getItem('techsystem_db');
    if (savedDb) {
      this.selectedDbSubject.next(savedDb);
    }
    const savedServer = localStorage.getItem('techsystem_server');
    if (savedServer) {
      this.selectedServerSubject.next(savedServer);
    }
  }

  setDatabase(dbName: string) {
    localStorage.setItem('techsystem_db', dbName);
    this.selectedDbSubject.next(dbName);
  }

  setServer(server: string) {
    localStorage.setItem('techsystem_server', server);
    this.selectedServerSubject.next(server);
  }

  get selectedDbValue(): string {
    return this.selectedDbSubject.value;
  }

  get selectedServerValue(): string {
    return this.selectedServerSubject.value;
  }

  login(credentials: any, dbName: string = 'BDRepuesto', server: string = 'YERY-PEREZ'): Observable<any> {
    this.setDatabase(dbName);
    this.setServer(server);
    return this.http.post(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((user: any) => {
        localStorage.setItem('techsystem_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('techsystem_user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
