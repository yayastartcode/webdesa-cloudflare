export const legacyTables = {
  "users": {
    "id": "String",
    "name": "String?",
    "email": "String",
    "emailVerified": "DateTime?",
    "image": "String?",
    "password": "String?",
    "role": "UserRole",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "posts": {
    "id": "String",
    "title": "String",
    "content": "String?",
    "published": "Boolean",
    "imageUrl": "String?",
    "createdAt": "DateTime",
    "updatedAt": "DateTime",
    "authorId": "String"
  },
  "header_settings": {
    "id": "String",
    "logoUrl": "String?",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "navigation_items": {
    "id": "String",
    "label": "String",
    "href": "String",
    "order": "Int",
    "isActive": "Boolean",
    "createdAt": "DateTime",
    "updatedAt": "DateTime",
    "headerSettingsId": "String"
  },
  "hero_slides": {
    "id": "String",
    "title": "String",
    "description": "String",
    "imageUrl": "String",
    "order": "Int",
    "isActive": "Boolean",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "village_info": {
    "id": "String",
    "visi": "String",
    "misi": "String",
    "tujuan": "String",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "village_head_welcome": {
    "id": "String",
    "content": "String",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "population_data": {
    "id": "String",
    "totalPopulation": "Int",
    "malePopulation": "Int",
    "femalePopulation": "Int",
    "households": "Int",
    "temporaryResidents": "Int",
    "populationMutations": "Int",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "employees": {
    "id": "String",
    "name": "String",
    "position": "String",
    "photoUrl": "String?",
    "order": "Int",
    "isActive": "Boolean",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "helpdesk": {
    "id": "String",
    "nama": "String",
    "nomorWhatsapp": "String",
    "kategoriPengaduan": "String",
    "pesanPengaduan": "String",
    "status": "String",
    "response": "String?",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "info": {
    "id": "String",
    "title": "String",
    "slug": "String",
    "pdfUrl": "String",
    "isActive": "Boolean",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "gallery": {
    "id": "String",
    "title": "String",
    "description": "String?",
    "imageUrl": "String",
    "category": "String?",
    "isActive": "Boolean",
    "order": "Int",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  },
  "apb_desa": {
    "id": "String",
    "year": "Int",
    "pendapatanDesa": "Decimal",
    "belanjaDesa": "Decimal",
    "isActive": "Boolean",
    "createdAt": "DateTime",
    "updatedAt": "DateTime"
  }
};
