# GRASP, SOLID Principles & Design Patterns in ScreenPLAY
### A Complete Code-Level Reference for OOAD

---

## PART 1 — GRASP Principles in ScreenPLAY

General Responsibility Assignment Software Patterns (GRASP) is a set of nine principles defined by Craig Larman that guide how to assign responsibilities to classes and objects in OO design. Each principle answers the question: *"Who should be responsible for doing X?"*

---

### 1.1 Creator

**Definition:** Assign class B the responsibility to create an instance of class A if B contains or aggregates A, B records A, B closely uses A, or B has the initialising data for A.

**Why it matters:** Placing object creation in the wrong class leads to tight coupling, duplicated initialisation logic, and classes that know more than they should.

**In ScreenPLAY — AuthServiceImpl creates User**

`AuthServiceImpl` is the Creator of `User` objects during signup because:
- It holds all the initialising data (`UserRequest`)
- It is responsible for encoding the password and generating the verification token
- It records the newly created `User` by saving it through the repository

```java
// AuthServiceImpl.java — signup()
User user = new User();
user.setEmail(userRequest.getEmail());
user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
user.setFullName(userRequest.getFullName());
user.setRole(Role.USER);
user.setActive(true);
user.setEmailVerified(false);

String verificationToken = UUID.randomUUID().toString();
user.setVerificationToken(verificationToken);
user.setVerificationTokenExpiry(Instant.now().plusSeconds(86400));

userRepository.save(user);
```

No other class has the right to create a `User` during registration because no other class has the full combination of request data, role assignment, password encoding, and token generation responsibilities.

**In ScreenPLAY — VideoServiceImpl creates Video**

`VideoServiceImpl.createVideoByAdmin()` is the Creator of `Video` because it owns the `VideoRequest` data and knows the mapping logic.

```java
// VideoServiceImpl.java — createVideoByAdmin()
Video video = new Video();
video.setTitle(videoRequest.getTitle());
video.setDescription(videoRequest.getDescription());
video.setYear(videoRequest.getYear());
video.setRating(videoRequest.getRating());
video.setDuration(videoRequest.getDuration());
video.setSrcUuid(extractUuid(videoRequest.getSrc()));
video.setPosterUuid(extractUuid(videoRequest.getPoster()));
video.setPublished(videoRequest.isPublished());
video.setCategories(
    videoRequest.getCategories() != null ? videoRequest.getCategories() : List.of()
);
videoRepository.save(video);
```

Note the `extractUuid()` helper is called only inside `VideoServiceImpl`, which further confirms its Creator role — it knows both the raw URL format and the UUID it needs to store.

**In ScreenPLAY — JwtAuthenticationFilter creates UserDetails**

`JwtAuthenticationFilter` is the Creator of Spring Security's `UserDetails` object during authentication because it holds the JWT token, extracts the username and role, and constructs the principal.

```java
// JwtAuthenticationFilter.java
private UserDetails createUserDetailsFromToken(String jwt, String username) {
    String role = jwtUtil.getRoleFromToken(jwt);

    return User.builder()
        .username(username)
        .password("")
        .authorities(Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role)))
        .build();
}
```

Only this class has the JWT string and the `JwtUtil` reference, making it the natural Creator of `UserDetails`.

---

### 1.2 Information Expert

**Definition:** Assign a responsibility to the class that has the information necessary to fulfill it.

**Why it matters:** If responsibility is assigned to a class that lacks the required data, that class will need to ask other classes for it, creating unnecessary coupling.

**In ScreenPLAY — Video entity knows its own URL**

The `Video` entity stores `srcUuid` and `posterUuid` as raw identifiers. It is the Information Expert for converting them to usable HTTP URLs because only it has the UUID and the context path.

```java
// Video.java
@JsonProperty("src")
public String getSrc() {
    if (srcUuid != null && !srcUuid.isEmpty()) {
        String baseUrl = ServletUriComponentsBuilder
            .fromCurrentContextPath().toUriString();
        return baseUrl + "/api/files/video/" + srcUuid;
    }
    return null;
}

@JsonProperty("poster")
public String getPoster() {
    if (posterUuid != null && !posterUuid.isEmpty()) {
        String baseUrl = ServletUriComponentsBuilder
            .fromCurrentContextPath().toUriString();
        return baseUrl + "/api/files/image/" + posterUuid;
    }
    return null;
}
```

No external class is needed to compute the URL — `Video` itself builds it from what it already has.

**In ScreenPLAY — UserServiceImpl knows admin safety rules**

`UserServiceImpl` is the Information Expert for enforcing admin-count constraints because it has access to both the `User` entity and the `UserRepository` count methods.

```java
// UserServiceImpl.java
private void ensureNotLastActiveAdmin(User user) {
    if (user.isActive() && user.getRole() == Role.ADMIN) {
        long activeAdminCount = userRepository.countByRoleAndActive(Role.ADMIN, true);
        if (activeAdminCount <= 1) {
            throw new RuntimeException("Cannot deactivate the last active admin user");
        }
    }
}

private void ensureNotLastAdmin(User user, String operation) {
    if (user.getRole() == Role.ADMIN) {
        long adminCount = userRepository.countByRole(Role.ADMIN);
        if (adminCount <= 1) {
            throw new RuntimeException("Cannot " + operation + " the last admin user");
        }
    }
}
```

These methods are called in `deleteUser()`, `toggleUserStatus()`, and `changeUserRole()` — all three situations where admin safety must be checked.

**In ScreenPLAY — JwtUtil knows token internals**

`JwtUtil` is the Information Expert for everything JWT-related. It owns the secret key, knows the expiry logic, and can extract any claim from a token.

```java
// JwtUtil.java
public String getUsernameFromToken(String token) {
    return getClaimFromToken(token, Claims::getSubject);
}

public String getRoleFromToken(String token) {
    return getClaimFromToken(token, claims -> claims.get("role", String.class));
}

private boolean isTokenExpired(String token) {
    final Date expiration = getExpirationDateFromToken(token);
    return expiration.before(new Date());
}

public boolean validateToken(String token) {
    try {
        getAllClaimsFromToken(token);
        return !isTokenExpired(token);
    } catch (Exception e) {
        return false;
    }
}
```

No other class in the system tries to parse JWT strings — all JWT questions are delegated to `JwtUtil`.

**In ScreenPLAY — UserRepository knows how to search watchlist**

`UserRepository` is the Information Expert for watchlist-related queries because it owns the JPQL that joins `User` and `Video` through the `user_watchlist` join table.

```java
// UserRepository.java
@Query("SELECT v FROM User u JOIN u.watchlist v WHERE u.id = :userId AND v.published = true")
Page<Video> findWatchlistByUserId(Long userId, Pageable pageable);

@Query("SELECT v.id FROM User u JOIN u.watchlist v WHERE u.email = :email AND v.id IN :videoIds")
Set<Long> findWatchlistVideoIds(@Param("email") String email, @Param("videoIds") List<Long> videoIds);
```

---

### 1.3 Low Coupling

**Definition:** Assign responsibilities so that coupling remains low. A class should depend on as few other classes as possible, and changes in one class should not force changes in many others.

**Why it matters:** High coupling makes systems brittle. Changing a single class triggers cascading changes across the codebase.

**In ScreenPLAY — Controllers depend on service interfaces, not implementations**

`VideoController` depends on `VideoService` (an interface), not on `VideoServiceImpl` (the concrete class). Spring injects the implementation at runtime.

```java
// VideoController.java
@Autowired
private VideoService videoService;

@PostMapping("/admin")
public ResponseEntity<MessageResponse> createVideoByAdmin(
        @Valid @RequestBody VideoRequest videoRequest) {
    return ResponseEntity.ok(videoService.createVideoByAdmin(videoRequest));
}
```

If the implementation changes — for example, switching from local file storage to cloud storage — the controller code does not change at all.

**In ScreenPLAY — CorsConfig is isolated from business logic**

`CorsConfig` only knows about HTTP origins and headers. It does not know anything about users, videos, or authentication. This isolates the cross-cutting concern of CORS completely.

```java
// CorsConfig.java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOriginsRaw;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOriginsRaw.split(",");

        registry.addMapping("/api/**")
            .allowedOrigins(origins)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("Authorization", "Content-Type", "Accept",
                            "Origin", "X-Requested-With", "Cache-Control")
            .exposedHeaders("Location", "Content-Disposition", "Authorization")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

**In ScreenPLAY — JwtAuthenticationFilter is decoupled from UserRepository**

`JwtAuthenticationFilter` does not touch the database at all. It uses only `JwtUtil` to validate the token and extract claims, then builds a Spring Security principal. This means the filter works entirely without a database call per request.

```java
// JwtAuthenticationFilter.java
private void processAuthentication(HttpServletRequest request,
                                   String jwt,
                                   String username) {
    if (jwtUtil.validateToken(jwt)) {
        UserDetails userDetails = createUserDetailsFromToken(jwt, username);
        setAuthenticationInContext(request, userDetails);
    }
}
```

---

### 1.4 Controller

**Definition:** Assign the responsibility of receiving or handling a system event to a non-UI class. The Controller mediates between the presentation layer and the domain/service layer.

**Why it matters:** Without a controller layer, business logic leaks into UI classes or HTTP handlers, making it untestable and tightly bound to the delivery mechanism.

**In ScreenPLAY — AuthController as the system event handler**

`AuthController` receives all authentication-related HTTP events and delegates every single use case to `AuthService`. It does not contain any business logic.

```java
// AuthController.java
@PostMapping("/signup")
public ResponseEntity<MessageResponse> signup(
        @Valid @RequestBody UserRequest userRequest) {
    return ResponseEntity.ok(authService.signup(userRequest));
}

@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
        @Valid @RequestBody LoginRequest loginRequest) {
    LoginResponse response = authService.login(
        loginRequest.getEmail(),
        loginRequest.getPassword());
    return ResponseEntity.ok(response);
}

@PostMapping("/change-password")
public ResponseEntity<MessageResponse> changePassword(
        Authentication authentication,
        @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
    String email = authentication.getName();
    return ResponseEntity.ok(
        authService.changePassword(
            email,
            changePasswordRequest.getCurrentPassword(),
            changePasswordRequest.getNewPassword()));
}
```

The controller's only job is: parse the HTTP input, extract the principal email, call the service, and wrap the result in a `ResponseEntity`.

**In ScreenPLAY — UserController as admin system controller**

`UserController` handles all admin user management events.

```java
// UserController.java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public ResponseEntity<MessageResponse> deleteUser(
        @PathVariable Long id,
        Authentication authentication) {
    String currentUserEmail = authentication.getName();
    return ResponseEntity.ok(userService.deleteUser(id, currentUserEmail));
}
```

The controller passes the authenticated email into the service, which enforces the business rule that an admin cannot delete their own account.

**In ScreenPLAY — JwtAuthenticationFilter as security event controller**

`JwtAuthenticationFilter` acts as the security controller for every incoming HTTP request. It decides whether authentication should be processed and orchestrates the token extraction, validation, and security context population.

```java
// JwtAuthenticationFilter.java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain)
        throws ServletException, IOException {

    String jwt = extractJwtToken(request);
    String username = null;
    if (jwt != null) {
        username = jwtUtil.getUsernameFromToken(jwt);
    }

    if (shouldProcessAuthentication(username)) {
        processAuthentication(request, jwt, username);
    }

    filterChain.doFilter(request, response);
}
```

---

### 1.5 High Cohesion

**Definition:** Assign responsibilities so that each class remains focused and manageable. A highly cohesive class has a narrow, well-defined purpose.

**Why it matters:** Low cohesion classes do too many things, become hard to maintain, and are difficult to test.

**In ScreenPLAY — Six tightly scoped service classes**

The project creates a separate `@Service` class for each concern:

| Class | Single Concern |
|---|---|
| `AuthServiceImpl` | Authentication, token flows, password management |
| `EmailServiceImpl` | Email message construction and delivery |
| `FileUploadServiceImpl` | Binary file storage and media streaming |
| `UserServiceImpl` | Admin user CRUD and role management |
| `VideoServiceImpl` | Video catalog, publishing, and statistics |
| `WatchlistServiceImpl` | Watchlist membership management |

```java
// EmailServiceImpl.java — only does email
@Service
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendVerificationEmail(String toEmail, String token) { ... }

    @Override
    public void sendPasswordResetEmail(String toEmail, String token) { ... }
}
```

There is no user-lookup, video logic, or file handling here — just email composition and transport.

**In ScreenPLAY — JwtUtil is cohesive around JWT operations**

`JwtUtil` only handles key management, token generation, claim extraction, expiry checking, and validation. All six methods serve a single technical purpose.

```java
// JwtUtil.java
private SecretKey getSigningKey() { ... }
public String getUsernameFromToken(String token) { ... }
public String getRoleFromToken(String token) { ... }
public Date getExpirationDateFromToken(String token) { ... }
public String generateToken(String username, String role) { ... }
public boolean validateToken(String token) { ... }
```

**In ScreenPLAY — VideoRepository is cohesive around video data access**

`VideoRepository` only deals with video data queries. Every method is either a derived Spring query or a JPQL query about the `Video` entity.

```java
// VideoRepository.java
Page<Video> searchVideos(@Param("search") String search, Pageable pageable);
long countPublishedVideos();
long getTotalDuration();
Page<Video> searchPublishedVideos(@Param("search") String search, Pageable pageable);
Page<Video> findPublishedVideos(Pageable pageable);
List<Video> findRandomPublishedVideos(Pageable pageable);
```

---

### 1.6 Polymorphism

**Definition:** When related alternatives or behaviors vary by type, assign responsibility for the behavior to the types for which it varies, using polymorphic operations.

**Why it matters:** Without polymorphism, you end up with chains of `if-else` or `switch` statements that must be modified every time a new variant is added.

**In ScreenPLAY — Service interfaces define polymorphic contracts**

All service classes implement interfaces. The controller depends on the interface, not the implementation.

```java
// AuthController depends on AuthService interface
@Autowired
private AuthService authService;    // could be any implementation
```

```java
// WatchlistController depends on WatchlistService interface
@Autowired
private WatchlistService watchlistService;
```

If the project required two different watchlist strategies (e.g., cloud-synced vs local), both could implement `WatchlistService` and the controller would not need modification.

**In ScreenPLAY — Spring Data repository polymorphism**

Both `UserRepository` and `VideoRepository` extend `JpaRepository<T, ID>`. Spring Data generates a concrete proxy at runtime. The code calls the interface methods and gets the correct behavior without knowing or caring about the underlying JDBC and Hibernate implementation.

```java
// UserRepository.java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    ...
}

// VideoRepository.java
public interface VideoRepository extends JpaRepository<Video, Long> {
    Page<Video> findPublishedVideos(Pageable pageable);
    ...
}
```

---

### 1.7 Pure Fabrication

**Definition:** Assign a cohesive set of responsibilities to an artificial class that does not represent any concept in the problem domain, when doing so supports low coupling and high cohesion.

**Why it matters:** Sometimes no domain class is the right home for a piece of logic. Rather than forcing the logic into an inappropriate domain class (and lowering cohesion), we create a helper class purely for design reasons.

**In ScreenPLAY — JwtUtil is a Pure Fabrication**

JWT tokens are not a business concept in the movie streaming domain. `JwtUtil` is a pure technical helper that exists solely to keep cryptographic and token logic out of `AuthServiceImpl`. It has no business meaning — it is a design artifact.

```java
// JwtUtil.java — a fabricated technical utility
@Component
public class JwtUtil {
    private static final long JWT_TOKEN_VALIDITY = 30L * 24 * 60 * 60 * 1000;

    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return doGenerateToken(claims, username);
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
            .signWith(getSigningKey())
            .compact();
    }
}
```

**In ScreenPLAY — CorsConfig is a Pure Fabrication**

Cross-origin resource sharing is not a domain concept in movie streaming. `CorsConfig` is a fabricated infrastructure class that exists purely to configure Spring MVC's CORS layer.

```java
// CorsConfig.java — no domain meaning, pure configuration artifact
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(origins)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            ...;
    }
}
```

**In ScreenPLAY — DTOs are Pure Fabrications**

`VideoResponse`, `UserResponse`, `MessageResponse`, `PageResponse`, and `VideoStatsResponse` do not represent any real-world entity. They are fabricated for the purpose of transferring data safely between layers.

```java
// VideoResponse.java — pure fabrication for API responses
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoResponse {
    private Long id;
    private String title;
    private String src;         // computed URL, not stored
    private Boolean isInWatchlist;  // contextual data, not stored
    ...
}
```

---

### 1.8 Indirection

**Definition:** To avoid direct coupling between two components, assign the responsibility to an intermediate object to mediate between them.

**Why it matters:** Direct dependencies make systems brittle. Indirection introduces a stable intermediary so that either side can vary without affecting the other.

**In ScreenPLAY — JwtAuthenticationFilter mediates between HTTP and Security Context**

The filter sits between the raw HTTP request and Spring Security's `SecurityContextHolder`. The controller never sees the JWT string; it only sees an `Authentication` object. This is a classic indirection pattern.

```java
// JwtAuthenticationFilter.java
private void setAuthenticationInContext(HttpServletRequest request,
                                        UserDetails userDetails) {
    UsernamePasswordAuthenticationToken authenticationToken =
        new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
    authenticationToken.setDetails(
        new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
}
```

Now the controller can simply call `authentication.getName()` without ever knowing about JWT:

```java
// VideoController.java
public ResponseEntity<PageResponse<VideoResponse>> getPublishedVideos(
        ...,
        Authentication authentication) {
    String email = authentication.getName();    // indirection at work
    return ResponseEntity.ok(videoService.getPublishedVideos(page, size, search, email));
}
```

**In ScreenPLAY — EmailService mediates between AuthServiceImpl and JavaMailSender**

`AuthServiceImpl` never calls `JavaMailSender` directly. It calls `EmailService`, which is the intermediary. If the email provider changes (e.g., from SMTP to SendGrid), only `EmailServiceImpl` changes — `AuthServiceImpl` is unaffected.

```java
// AuthServiceImpl.java — uses the intermediary
emailService.sendVerificationEmail(userRequest.getEmail(), verificationToken);
emailService.sendPasswordResetEmail(email, resetToken);
```

```java
// EmailServiceImpl.java — the actual intermediary
@Override
public void sendVerificationEmail(String toEmail, String token) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(toEmail);
    message.setSubject("ScreenPLAY - Verify Your Email");
    ...
    mailSender.send(message);
}
```

---

### 1.9 Protected Variations

**Definition:** Identify points of predicted variation or instability; assign responsibilities to create a stable interface around them.

**Why it matters:** Some parts of a system change more often than others — storage backends, email providers, security algorithms. Wrapping these volatile areas in stable interfaces means the rest of the system is shielded from those changes.

**In ScreenPLAY — FileUploadService shields storage implementation**

The entire file storage and streaming implementation is behind `FileUploadService`. The interface defines a stable contract:

```java
// FileUploadService.java (interface — the stable boundary)
public interface FileUploadService {
    String storeVideoFile(MultipartFile file);
    String storeImageFile(MultipartFile file);
    ResponseEntity<Resource> serveVideo(String uuid, String rangeHeader);
    ResponseEntity<Resource> serveImage(String uuid);
}
```

The concrete implementation uses local disk with `Path` and `Files.copy()`:

```java
// FileUploadServiceImpl.java
private String storeFile(MultipartFile file, Path storageLocation) {
    String fileExtension = FileHandlerUtil.extractFileExtension(file.getOriginalFilename());
    String uuid = UUID.randomUUID().toString();
    String fileName = uuid + fileExtension;
    Path targetLocation = storageLocation.resolve(fileName);
    Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
    return uuid;
}
```

If storage moves to AWS S3 or Azure Blob, a new `S3FileUploadServiceImpl` can be written and injected — the rest of the application changes nothing.

**In ScreenPLAY — @Value annotation protects against configuration variation**

`CorsConfig` and `JwtUtil` use `@Value` to read configuration, which protects the code from environment-specific changes.

```java
// JwtUtil.java
@Value("${jwt.secret:defaultSecretKeyForScreenplay}")
private String secret;

// CorsConfig.java
@Value("${app.cors.allowed-origins:http://localhost:5173}")
private String allowedOriginsRaw;
```

Changing the secret key or allowed CORS origins only requires updating `application.properties`, not the code.

**In ScreenPLAY — Video entity protects UUID from JSON consumers**

`srcUuid` and `posterUuid` are `@JsonIgnore`. The raw UUID is a volatile implementation detail that could change (e.g., to a path or an S3 key). The stable interface exposed to the API is the `getSrc()` / `getPoster()` URL methods.

```java
// Video.java
@Column(name = "src")
@JsonIgnore
private String srcUuid;       // hidden volatile field

@JsonProperty("src")
public String getSrc() {      // stable API surface
    if (srcUuid != null && !srcUuid.isEmpty()) {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().toUriString();
        return baseUrl + "/api/files/video/" + srcUuid;
    }
    return null;
}
```

---

## PART 2 — SOLID Principles in ScreenPLAY

SOLID is a group of five principles introduced by Robert C. Martin (Uncle Bob) that guide OO design toward maintainability, flexibility, and extensibility.

---

### 2.1 Single Responsibility Principle (SRP)

**Definition:** A class should have one, and only one, reason to change. Put differently, a class should have only one job.

**Why it matters:** If a class has multiple responsibilities, it has multiple reasons to change. A change for one reason may accidentally break the behavior defined for another reason.

**In ScreenPLAY — Each service class has exactly one job**

`EmailServiceImpl` only composes and delivers emails. If the project later adopts HTML emails instead of plain text, only `EmailServiceImpl` changes. Video, User, Auth, and Watchlist services are unaffected.

```java
// EmailServiceImpl.java — one responsibility: send emails
@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("ScreenPLAY - Verify Your Email");
        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        String emailBody = "Welcome to ScreenPLAY!\n\n"
            + "Please verify your email address by clicking: \n\n"
            + verificationLink + "\n\n"
            + "This link will expire in 24 hours.";
        message.setText(emailBody);
        mailSender.send(message);
    }
}
```

`FileUploadServiceImpl` only handles binary file I/O. Its only reason to change is if the file storage mechanism changes.

```java
// FileUploadServiceImpl.java — one responsibility: store and serve binary files
@PostConstruct
public void init() {
    this.videoStorageLocation = Paths.get(videoDir).toAbsolutePath().normalize();
    this.imageStorageLocation = Paths.get(imageDir).toAbsolutePath().normalize();
    Files.createDirectories(videoStorageLocation);
    Files.createDirectories(imageStorageLocation);
}
```

**In ScreenPLAY — DTOs have one reason to change**

`VideoStatsResponse` only exists to carry three statistics fields to the frontend. If the admin dashboard needs a new stat, only this DTO and the query change.

```java
// VideoStatsResponse.java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoStatsResponse {
    private long totalVideos;
    private long publishedVideos;
    private long totalDuration;
}
```

**Violation Example — what this project avoids**

A violation of SRP would be putting email-sending logic inside `AuthServiceImpl`:
```java
// VIOLATION — DO NOT DO THIS
public MessageResponse signup(UserRequest userRequest) {
    User user = new User();
    ...
    // Building and sending email INSIDE AuthServiceImpl
    SimpleMailMessage message = new SimpleMailMessage();
    message.setSubject("Verify Your Email");
    mailSender.send(message);   // now AuthServiceImpl has two reasons to change
}
```
Instead, this project correctly delegates to `EmailService`.

---

### 2.2 Open-Closed Principle (OCP)

**Definition:** Software entities (classes, modules, functions) should be open for extension but closed for modification. You should be able to add new behavior without changing existing code.

**Why it matters:** Modifying existing code risks introducing regressions. OCP pushes you toward adding new implementations rather than editing old ones.

**In ScreenPLAY — Service interfaces are closed for modification, open for extension**

The `EmailService` interface is closed (its existing methods do not change), but it is open for extension — a new method can be added to the interface and implemented in `EmailServiceImpl` or a new `HtmlEmailServiceImpl`.

```java
// Current stable interface — closed for modification
public interface EmailService {
    void sendVerificationEmail(String toEmail, String token);
    void sendPasswordResetEmail(String toEmail, String token);
}

// Future extension — a new implementation without touching existing code
public class SendGridEmailServiceImpl implements EmailService {
    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        // SendGrid HTTP API call
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        // SendGrid HTTP API call
    }
}
```

**In ScreenPLAY — VideoRepository custom queries are additive**

Adding new query methods to `VideoRepository` does not change any existing method. The `findRandomPublishedVideos` was added without modifying `findPublishedVideos`.

```java
// VideoRepository.java — each query is independent, closed, addable
@Query("SELECT v FROM Video v WHERE v.published = true ORDER BY v.createdAt DESC")
Page<Video> findPublishedVideos(Pageable pageable);

@Query("SELECT v FROM Video v WHERE v.published = true ORDER BY FUNCTION('RAND')")
List<Video> findRandomPublishedVideos(Pageable pageable);
```

**In ScreenPLAY — UserServiceImpl role validation is open for extension**

The `validateRole()` method uses `Arrays.stream(Role.values())` so that adding a new `Role` enum value (e.g., `MODERATOR`) automatically makes it valid without changing `validateRole()`:

```java
// UserServiceImpl.java
private void validateRole(String role) {
    boolean valid = Arrays.stream(Role.values())
        .anyMatch(r -> r.name().equalsIgnoreCase(role));

    if (!valid) {
        throw new InvalidRoleException("Invalid role: " + role);
    }
}
```

Adding `MODERATOR` to the `Role` enum is the only change required — the validation logic is already open for extension.

---

### 2.3 Liskov Substitution Principle (LSP)

**Definition:** Objects of a subtype must be substitutable for objects of their supertype without altering the correctness of the program. If S is a subtype of T, then objects of type T in a program may be replaced with objects of type S without changing any of the desirable properties of that program.

**Why it matters:** LSP violations break polymorphism at runtime. Code that works correctly with the base type breaks when given the subtype.

**In ScreenPLAY — All service implementations honor their interface contracts**

`AuthController` depends on `AuthService`. `AuthServiceImpl` fully honors the `AuthService` contract — every method works as declared and returns the documented type.

```java
// AuthService.java — declares the contract
public interface AuthService {
    MessageResponse signup(UserRequest userRequest);
    LoginResponse login(String email, String password);
    MessageResponse verifyEmail(String token);
    ...
}

// AuthServiceImpl.java — fully satisfies the contract
@Override
public MessageResponse signup(UserRequest userRequest) {
    ...
    return new MessageResponse("Registration successful! Please check your email.");
}

@Override
public LoginResponse login(String email, String password) {
    ...
    return new LoginResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
}
```

The controller code `authService.signup(...)` works correctly with `AuthServiceImpl` and would work equally correctly with a mock or any other `AuthService` implementation — this is LSP in action.

**In ScreenPLAY — Spring UserDetails substitution in JwtAuthenticationFilter**

`JwtAuthenticationFilter` constructs a `UserDetails` using `User.builder()`. The object is then stored in `SecurityContextHolder`. Spring Security internally works with the `UserDetails` interface, not the concrete `User` class — the substitution is transparent.

```java
// JwtAuthenticationFilter.java
private UserDetails createUserDetailsFromToken(String jwt, String username) {
    String role = jwtUtil.getRoleFromToken(jwt);
    return User.builder()              // returns a UserDetails-compatible object
        .username(username)
        .password("")
        .authorities(Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role)))
        .build();
}
```

**LSP Violation Example — what this project avoids**

A violation would be if a second `AuthService` implementation threw a `NullPointerException` or returned `null` where the interface contract specifies a `LoginResponse`:
```java
// VIOLATION — DO NOT DO THIS
public class CachedAuthServiceImpl implements AuthService {
    @Override
    public LoginResponse login(String email, String password) {
        return null; // LSP broken — callers expect a non-null LoginResponse
    }
}
```

---

### 2.4 Interface Segregation Principle (ISP)

**Definition:** Clients should not be forced to depend on interfaces they do not use. Split large interfaces into smaller, more specific ones so that clients only know about the methods they care about.

**Why it matters:** Fat interfaces create unnecessary dependencies. A class that uses only one method of a ten-method interface still gets recompiled if any other method changes.

**In ScreenPLAY — Each service interface is narrow and focused**

`WatchlistService` has exactly the three methods a watchlist client needs. It does not include video management or user management methods.

```java
// WatchlistService.java — narrow interface
public interface WatchlistService {
    MessageResponse addToWatchlist(String email, Long videoId);
    MessageResponse removeFromWatchlist(String email, Long videoId);
    PageResponse<VideoResponse> getWatchlistPaginated(String email, int page, int size, String search);
}
```

`WatchlistController` depends only on `WatchlistService`. It is not forced to know about video publishing or user role changes.

```java
// WatchlistController.java — depends on the small interface only
@Autowired
private WatchlistService watchlistService;
```

`FileUploadService` is segregated from all domain business logic:

```java
// FileUploadService.java — only file I/O operations
public interface FileUploadService {
    String storeVideoFile(MultipartFile file);
    String storeImageFile(MultipartFile file);
    ResponseEntity<Resource> serveVideo(String uuid, String rangeHeader);
    ResponseEntity<Resource> serveImage(String uuid);
}
```

`FileUploadController` uses this interface. It never touches `UserService` or `VideoService` — it is cleanly segregated.

**ISP Violation Example — what this project avoids**

A violation would be combining all services into a monolithic interface:
```java
// VIOLATION — DO NOT DO THIS
public interface AppService {
    LoginResponse login(String email, String password);
    MessageResponse addToWatchlist(String email, Long videoId);
    String storeVideoFile(MultipartFile file);
    MessageResponse createVideoByAdmin(VideoRequest req);
    // FileUploadController would be forced to depend on login() methods it never uses
}
```

---

### 2.5 Dependency Inversion Principle (DIP)

**Definition:** High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

**Why it matters:** When high-level business logic directly instantiates low-level infrastructure classes, the logic becomes inseparable from the infrastructure and untestable in isolation.

**In ScreenPLAY — All controllers depend on service abstractions**

```java
// VideoController.java — high-level module depends on abstraction
@Autowired
private VideoService videoService;  // interface, not VideoServiceImpl

// WatchlistController.java
@Autowired
private WatchlistService watchlistService;  // interface

// FileUploadController.java
@Autowired
private FileUploadService fileUploadService;  // interface
```

Spring injects the concrete implementations. The controllers never call `new VideoServiceImpl()` — they do not even know `VideoServiceImpl` exists.

**In ScreenPLAY — AuthServiceImpl depends on abstractions, not concretions**

```java
// AuthServiceImpl.java — high-level service depends only on abstractions
@Autowired
private UserRepository userRepository;      // JpaRepository abstraction

@Autowired
private PasswordEncoder passwordEncoder;    // Spring Security abstraction

@Autowired
private EmailService emailService;          // service interface, not EmailServiceImpl

@Autowired
private JwtUtil jwtUtil;                    // single utility component

@Autowired
private ServiceUtils serviceUtils;          // fabricated utility
```

`AuthServiceImpl` does not import `BCryptPasswordEncoder`, `SimpleMailMessage`, or `EmailServiceImpl` anywhere. All its dependencies point upward to abstractions.

**In ScreenPLAY — JwtAuthenticationFilter depends on JwtUtil abstraction**

`JwtAuthenticationFilter` depends on `JwtUtil`, not on any specific JWT library class. `JwtUtil` wraps the `io.jsonwebtoken` library, so a library change affects only `JwtUtil`, not the filter.

```java
// JwtAuthenticationFilter.java
@Autowired
private JwtUtil jwtUtil;                    // component abstraction

// Inside filter — never calls Jwts.parser() directly
if (jwtUtil.validateToken(jwt)) {
    UserDetails userDetails = createUserDetailsFromToken(jwt, username);
    setAuthenticationInContext(request, userDetails);
}
```

---

## PART 3 — Design Patterns in ScreenPLAY

Design patterns are proven, reusable solutions to recurring software design problems. They are categorised into three groups: Creational (object construction), Structural (composition), and Behavioural (interaction). This section covers the four Creational patterns in depth.

---

### Introduction to Design Patterns

A design pattern is not a ready-to-paste snippet. It is a description of a solution to a problem in context. Before selecting a pattern, three questions must be answered:
1. **What problem does it solve?**
2. **What are the trade-offs?**
3. **Does this problem actually occur in our code?**

In ScreenPLAY, the patterns used are primarily Creational, with several Behavioural patterns supported by the Spring framework.

---

### 3.1 Singleton Pattern

**Intent:** Ensure that a class has only one instance and provide a global point of access to it.

**When to use:** When exactly one object is needed to coordinate actions across the system — e.g., a shared configuration store, a connection pool, a thread-safe counter, or a utility class with no mutable state.

**Classic Java Implementation:**

```java
// Classic Thread-Safe Singleton
public final class ApplicationConfig {
    // volatile ensures visibility across threads
    private static volatile ApplicationConfig instance;
    private final String jwtSecret;

    // Private constructor prevents external instantiation
    private ApplicationConfig() {
        this.jwtSecret = System.getenv("JWT_SECRET");
    }

    public static ApplicationConfig getInstance() {
        if (instance == null) {
            synchronized (ApplicationConfig.class) {
                // Double-checked locking
                if (instance == null) {
                    instance = new ApplicationConfig();
                }
            }
        }
        return instance;
    }

    public String getJwtSecret() {
        return jwtSecret;
    }
}
```

**In ScreenPLAY — Spring-managed Singleton beans**

Spring's IoC container manages every `@Service`, `@Component`, `@Repository`, and `@Configuration` bean as a singleton by default. The container creates exactly one instance and injects it wherever it is requested.

```java
// Application.java — Spring's entry point
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        // Spring creates single instances of all beans here
    }
}
```

`JwtUtil` is declared as `@Component`:

```java
// JwtUtil.java — singleton-scoped Spring bean
@Component
public class JwtUtil {
    private static final long JWT_TOKEN_VALIDITY = 30L * 24 * 60 * 60 * 1000;

    @Value("${jwt.secret:defaultSecretKeyForScreenplay}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String role) { ... }
    public boolean validateToken(String token) { ... }
}
```

Both `AuthServiceImpl` and `JwtAuthenticationFilter` inject the same `JwtUtil` bean — the very same instance:

```java
// AuthServiceImpl.java
@Autowired
private JwtUtil jwtUtil;

// JwtAuthenticationFilter.java
@Autowired
private JwtUtil jwtUtil;
```

`CorsConfig` is another singleton:

```java
// CorsConfig.java — singleton configuration bean
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) { ... }
}
```

**Why Singleton here:** `JwtUtil` manages a cryptographic signing key derived from a configured secret. Having multiple instances risks key inconsistency. Singleton guarantees the same key is used for all token generation and validation.

**Pattern Participants:**

| Participant | Role in ScreenPLAY |
|---|---|
| Singleton | `JwtUtil`, `AuthServiceImpl`, `VideoServiceImpl`, etc. |
| Instance | Spring application context manages the single instance |
| GlobalAccessPoint | `@Autowired` injection point in every class that needs it |

---

### 3.2 Factory Method Pattern

**Intent:** Define an interface for creating an object, but let subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.

**When to use:** When the exact type of object to create is not known at compile time, or when you want to centralise object creation and hide the instantiation details.

**Classic Java Implementation:**

```java
// Abstract product
public interface Notification {
    void send(String recipient, String message);
}

// Concrete products
public class EmailNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        System.out.println("Email to " + recipient + ": " + message);
    }
}

public class SmsNotification implements Notification {
    @Override
    public void send(String recipient, String message) {
        System.out.println("SMS to " + recipient + ": " + message);
    }
}

// Creator (abstract factory method)
public abstract class NotificationService {
    public abstract Notification createNotification();  // factory method

    public void notify(String recipient, String message) {
        Notification notification = createNotification();
        notification.send(recipient, message);
    }
}

// Concrete creators
public class EmailNotificationService extends NotificationService {
    @Override
    public Notification createNotification() {
        return new EmailNotification();
    }
}

public class SmsNotificationService extends NotificationService {
    @Override
    public Notification createNotification() {
        return new SmsNotification();
    }
}
```

**In ScreenPLAY — Static Factory Methods in DTOs**

`VideoResponse.fromEntity(Video video)` and `UserResponse.fromEntity(User user)` are static factory methods. They centralise object creation, hide the constructor call, and express the intent clearly through a named method.

```java
// VideoResponse.java — static factory method
public static VideoResponse fromEntity(Video video) {
    VideoResponse response = new VideoResponse(
        video.getId(),
        video.getTitle(),
        video.getDescription(),
        video.getYear(),
        video.getRating(),
        video.getDuration(),
        video.getSrc(),        // calls the computed getter in Video entity
        video.getPoster(),     // calls the computed getter in Video entity
        video.isPublished(),
        video.getCategories(),
        video.getCreatedAt(),
        video.getUpdatedAt()
    );

    if (video.getIsInWatchlist() != null) {
        response.setIsInWatchlist(video.getIsInWatchlist());
    }
    return response;
}
```

```java
// UserResponse.java — static factory method
public static UserResponse fromEntity(User user) {
    return new UserResponse(
        user.getId(),
        user.getEmail(),
        user.getFullName(),
        user.getRole().name(),   // enum to String conversion centralised here
        user.isActive(),
        user.getCreatedAt(),
        user.getUpdatedAt());
}
```

These factory methods are called in the service layer using method references:

```java
// VideoServiceImpl.java — uses factory method as a function reference
return PaginationUtils.toPageResponse(videoPage, VideoResponse::fromEntity);

// UserServiceImpl.java — uses factory method as a function reference
return PaginationUtils.toPageResponse(userPage, UserResponse::fromEntity);
```

This is a clean application of the Factory pattern: the caller says "convert this page of entities to DTOs" but delegates the construction details to the factory method.

**In ScreenPLAY — FileUploadController's buildUploadResponse is a factory method**

```java
// FileUploadController.java
private Map<String, String> buildUploadResponse(String uuid, MultipartFile file) {
    Map<String, String> response = new HashMap<>();
    response.put("uuid", uuid);
    response.put("fileName", file.getOriginalFilename());
    response.put("size", String.valueOf(file.getSize()));
    return response;
}

@PostMapping("/upload/video")
public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
    String uuid = fileUploadService.storeVideoFile(file);
    return ResponseEntity.ok(buildUploadResponse(uuid, file));   // factory method called here
}

@PostMapping("/upload/image")
public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
    String uuid = fileUploadService.storeImageFile(file);
    return ResponseEntity.ok(buildUploadResponse(uuid, file));   // same factory method reused
}
```

The `buildUploadResponse` method is called from both `uploadVideo` and `uploadImage`, avoiding response construction duplication.

---

### 3.3 Builder Pattern

**Intent:** Separate the construction of a complex object from its representation so that the same construction process can create different representations. Allows step-by-step construction and eliminates telescoping constructors.

**When to use:** When an object requires many steps or options to build, when there are many optional parameters, or when the order of construction steps matters.

**Classic Java Implementation:**

```java
// Product
public class JwtToken {
    private final String subject;
    private final String role;
    private final long expiryMs;
    private final Map<String, Object> extraClaims;

    // Private constructor — only Builder can call it
    private JwtToken(Builder builder) {
        this.subject = builder.subject;
        this.role = builder.role;
        this.expiryMs = builder.expiryMs;
        this.extraClaims = builder.extraClaims;
    }

    // Builder class
    public static class Builder {
        private String subject;
        private String role;
        private long expiryMs = 86400000L;  // default 24 hours
        private Map<String, Object> extraClaims = new HashMap<>();

        public Builder subject(String subject) {
            this.subject = subject;
            return this;
        }
        public Builder role(String role) {
            this.role = role;
            return this;
        }
        public Builder expiryMs(long expiryMs) {
            this.expiryMs = expiryMs;
            return this;
        }
        public Builder claim(String key, Object value) {
            this.extraClaims.put(key, value);
            return this;
        }
        public JwtToken build() {
            if (subject == null) throw new IllegalStateException("Subject required");
            return new JwtToken(this);
        }
    }
}

// Usage
JwtToken token = new JwtToken.Builder()
    .subject("user@example.com")
    .role("USER")
    .expiryMs(3600000L)
    .claim("department", "engineering")
    .build();
```

**In ScreenPLAY — JwtUtil uses the JJWT Builder**

`JwtUtil.doGenerateToken()` uses the `Jwts.builder()` fluent builder provided by the JJWT library. Each method call sets one attribute of the token, and `.compact()` is the terminal `build()` call.

```java
// JwtUtil.java — Builder pattern in action
private String doGenerateToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
        .claims(claims)                                             // Step 1: set claims map
        .subject(subject)                                           // Step 2: set subject
        .issuedAt(new Date(System.currentTimeMillis()))             // Step 3: issue time
        .expiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))  // Step 4: expiry
        .signWith(getSigningKey())                                  // Step 5: sign with HMAC key
        .compact();                                                 // Final: build the token string
}
```

Each `.claims()`, `.subject()`, `.issuedAt()`, `.expiration()`, `.signWith()` call modifies the internal state of the builder object. The final `.compact()` produces the immutable JWT string.

**In ScreenPLAY — JwtAuthenticationFilter uses Spring Security's UserDetails Builder**

```java
// JwtAuthenticationFilter.java — Builder pattern for UserDetails
private UserDetails createUserDetailsFromToken(String jwt, String username) {
    String role = jwtUtil.getRoleFromToken(jwt);

    return User.builder()                          // Builder entry point
        .username(username)                        // Step 1: set username
        .password("")                              // Step 2: set password (empty — JWT-based auth)
        .authorities(Collections.singletonList(    // Step 3: set granted authorities
            new SimpleGrantedAuthority("ROLE_" + role)))
        .build();                                  // Final: construct UserDetails object
}
```

This builds a Spring Security `UserDetails` object step-by-step without needing a complex constructor call. The Builder is also readable — each step is self-documenting.

**In ScreenPLAY — Lombok @Data and @AllArgsConstructor generate Builder-like patterns**

The DTO classes use Lombok to eliminate boilerplate. `@AllArgsConstructor` generates a constructor that accepts every field in order — which is essentially a simplified Builder.

```java
// VideoStatsResponse.java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoStatsResponse {
    private long totalVideos;
    private long publishedVideos;
    private long totalDuration;
}

// Used in VideoServiceImpl.java
return new VideoStatsResponse(totalVideos, publishedVideos, totalDuration);
```

For `MessageResponse`, Lombok enables clean one-line construction:

```java
// MessageResponse.java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private String message;
}

// Used everywhere
return new MessageResponse("Password changed successfully");
```

---

### 3.4 Prototype Pattern

**Intent:** Specify the kinds of objects to create using a prototypical instance, and create new objects by copying (cloning) this prototype. Avoids the cost of creating objects from scratch when a pre-configured copy is sufficient.

**When to use:** When object creation is expensive, when you need many similar objects that differ only in small ways, or when you want to avoid subclassing for configuration variants.

**Classic Java Implementation:**

```java
// Prototype interface
public abstract class VideoTemplate implements Cloneable {
    protected String rating;
    protected boolean published;
    protected List<String> categories;

    public abstract VideoTemplate clone();

    public void setRating(String rating) { this.rating = rating; }
    public void setCategories(List<String> categories) { this.categories = categories; }
}

// Concrete prototype
public class MovieTemplate extends VideoTemplate {
    private String genre;

    @Override
    public MovieTemplate clone() {
        try {
            MovieTemplate cloned = (MovieTemplate) super.clone();
            // Deep copy mutable fields
            cloned.categories = new ArrayList<>(this.categories);
            return cloned;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException("Clone not supported", e);
        }
    }
}

// Prototype Registry
public class VideoTemplateRegistry {
    private static final Map<String, VideoTemplate> templates = new HashMap<>();

    static {
        MovieTemplate drama = new MovieTemplate();
        drama.setRating("PG-13");
        drama.setCategories(List.of("Drama"));
        templates.put("drama", drama);

        MovieTemplate action = new MovieTemplate();
        action.setRating("R");
        action.setCategories(List.of("Action", "Thriller"));
        templates.put("action", action);
    }

    public static VideoTemplate getTemplate(String type) {
        return templates.get(type).clone();  // return a clone, not the original
    }
}

// Usage
VideoTemplate newDramaVideo = VideoTemplateRegistry.getTemplate("drama");
```

**In ScreenPLAY — Current state and future application**

The current ScreenPLAY codebase does not implement Prototype explicitly, but the concept is partially visible in how `Video` objects are assembled in `updateVideoByAdmin`:

```java
// VideoServiceImpl.java — update creates a fresh Video with the same ID
@Override
public MessageResponse updateVideoByAdmin(Long id, VideoRequest videoRequest) {
    Video video = new Video();         // new object
    video.setId(id);                   // reuse existing ID (prototype-like identity copy)
    video.setTitle(videoRequest.getTitle());
    video.setDescription(videoRequest.getDescription());
    ...
    videoRepository.save(video);
    return new MessageResponse("Video updated successfully");
}
```

A true Prototype implementation would clone an existing `Video` from the repository and modify only the changed fields, which would be especially useful for creating "similar" video entries or template-based content creation.

**Future implementation for ScreenPLAY:**

```java
// How Prototype would look applied to ScreenPLAY
@Override
public MessageResponse duplicateVideo(Long sourceId, String newTitle) {
    Video source = serviceUtils.getVideoByIdOrThrow(sourceId);

    // Clone the source video
    Video clone = new Video();
    clone.setTitle(newTitle);
    clone.setDescription(source.getDescription());
    clone.setYear(source.getYear());
    clone.setRating(source.getRating());
    clone.setDuration(source.getDuration());
    clone.setSrcUuid(source.getSrcUuid());
    clone.setPosterUuid(source.getPosterUuid());
    clone.setCategories(new ArrayList<>(source.getCategories())); // deep copy
    clone.setPublished(false); // new video starts unpublished

    videoRepository.save(clone);
    return new MessageResponse("Video duplicated successfully");
}
```

---

## PART 4 — Consolidated Pattern Map

| File | GRASP | SOLID | Pattern |
|---|---|---|---|
| `Application.java` | Controller (entry point) | — | Singleton (Spring bootstrap) |
| `User.java` | Information Expert (owns URL building) | SRP (entity only) | — |
| `Video.java` | Information Expert (UUID → URL), Protected Variations | SRP, OCP | — |
| `UserRepository.java` | Information Expert (watchlist JPQL) | ISP (user queries only) | — |
| `VideoRepository.java` | Information Expert (video queries) | ISP (video queries only) | — |
| `CorsConfig.java` | Pure Fabrication | SRP (CORS only) | Singleton (Spring bean) |
| `JwtUtil.java` | Pure Fabrication, Information Expert | SRP (JWT only), ISP | Singleton, Builder (internal) |
| `JwtAuthenticationFilter.java` | Controller, Indirection, Low Coupling | SRP, DIP | Builder (UserDetails), Chain of Responsibility |
| `AuthController.java` | Controller | SRP, DIP | — |
| `VideoController.java` | Controller | SRP, DIP | — |
| `UserController.java` | Controller | SRP, DIP | — |
| `WatchlistController.java` | Controller | SRP, DIP, ISP | — |
| `FileUploadController.java` | Controller | SRP, DIP | Factory (buildUploadResponse) |
| `AuthServiceImpl.java` | Creator (User), Controller, Indirection | SRP, OCP, DIP | Singleton (Spring), Builder (User construction) |
| `EmailServiceImpl.java` | Pure Fabrication, High Cohesion | SRP, LSP, ISP | Singleton |
| `FileUploadServiceImpl.java` | Information Expert, Protected Variations | SRP, OCP, DIP | Singleton |
| `UserServiceImpl.java` | Creator, Information Expert, High Cohesion | SRP, OCP, LSP | Singleton |
| `VideoServiceImpl.java` | Creator, Information Expert, Controller | SRP, OCP, DIP | Singleton, Factory (fromEntity) |
| `WatchlistServiceImpl.java` | High Cohesion, Low Coupling | SRP, ISP, DIP | Singleton |
| `VideoResponse.java` | Pure Fabrication | SRP | Factory Method (fromEntity) |
| `UserResponse.java` | Pure Fabrication | SRP | Factory Method (fromEntity) |
| `MessageResponse.java` | Pure Fabrication | SRP | Builder (Lombok) |
| `VideoStatsResponse.java` | Pure Fabrication | SRP | Builder (Lombok) |
| `PageResponse.java` | Pure Fabrication | SRP | Builder (Lombok) |
