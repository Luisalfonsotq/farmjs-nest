```mermaid
erDiagram
    usuarios {
        int id PK
        string nombre
        string email
        string password
        string rol "ENUM: administrador, supervisor, veterinario, colaborador"
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    fincas {
        int id PK
        string nombre
        string ubicacion
        int propietario_id FK "FK a usuarios.id con rol administrador"
        decimal tamano_ha
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    potreros {
        int id PK
        string nombre
        decimal tamano_ha
        string tipo_pasto
        int finca_id FK
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
        timestamp ocupado_desde "Para historial de ocupacion"
        timestamp ocupado_hasta "Para historial de ocupacion"
    }

    animales {
        int id PK
        string arete_unico "UNIQUE"
        string raza
        string sexo "ENUM: macho, hembra"
        date fecha_nacimiento
        string estado_reproductivo "ENUM: lactancia, prenada, vacia, en_produccion, engorde"
        string estado_salud "ENUM: sano, enfermo, en_tratamiento"
        string origen "ENUM: nativo, foraneo"
        date fecha_adquisicion "NULL si nativo"
        int proveedor_id FK "NULL si nativo, FK a proveedores.id"
        int potrero_id FK
        int finca_id FK
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    controles_sanitarios {
        int id PK
        int animal_id FK
        int tipo_control_id FK
        int veterinario_id FK "FK a usuarios.id con rol veterinario"
        date fecha
        string medicamento
        decimal dosis
        string via_aplicacion "Ej: oral, inyectable, topica"
        string observaciones
        decimal costo
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    tipos_control_sanitario {
        int id PK
        string nombre
        string descripcion
        boolean aplica_a_sexo "Ej: castracion solo a machos"
        boolean requiere_medicamento "Ej: vacuna si, pesaje no"
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    reproducciones {
        int id PK
        int animal_id FK "FK a animales (madre)"
        date fecha_celo
        date fecha_monta
        string tipo_monta "ENUM: natural, inseminacion"
        int toro_id FK "FK a animales (padre, si es natural o semen de toro especifico)"
        date fecha_confirmacion_prenez
        date fecha_parto
        int crias_nacidas "Numero de crias"
        string observaciones
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    crias {
        int id PK
        int animal_id FK "FK a animales (la cria en si)"
        int madre_id FK "FK a animales (madre)"
        int padre_id FK "FK a animales (padre, opcional)"
        date fecha_nacimiento "Duplicado de animales.fecha_nacimiento, puede ser util para simplicidad"
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    eventos_animales {
        int id PK
        int animal_id FK
        int tipo_evento_id FK "FK a tipos_evento_animal.id"
        date fecha
        string detalle
        decimal valor_medida "Ej: peso en kg"
        int potrero_anterior_id FK "NULL si no aplica"
        int potrero_actual_id FK "NULL si no aplica"
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    tipos_evento_animal {
        int id PK
        string nombre "Ej: nacimiento, baja, venta, muerte, cambio_de_potrero, pesaje"
        string descripcion
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    proveedores {
        int id PK
        string nombre
        string contacto
        string telefono
        string direccion
        string observaciones
        timestamp creado_en
        timestamp actualizado_en
        timestamp eliminado_en
    }

    usuario_finca {
        int usuario_id PK, FK
        int finca_id PK, FK
        timestamp creado_en
        timestamp actualizado_en
    }

    usuarios ||--o{ usuario_finca : "gestiona"
    fincas ||--o{ usuario_finca : "es_gestionada_por"
    fincas ||--o{ potreros : "contiene"
    fincas ||--o{ animales : "posee"
    potreros ||--o{ animales : "ocupa"
    animales ||--o{ controles_sanitarios : "recibe"
    tipos_control_sanitario ||--o{ controles_sanitarios : "define_tipo_de"
    animales ||--o{ reproducciones : "involucrada_en"
    animales ||--o{ crias : "es_madre_o_padre_de"
    animales ||--o{ eventos_animales : "participa_en"
    tipos_evento_animal ||--o{ eventos_animales : "define_tipo_de"
    proveedores ||--o{ animales : "suministra"
    animales ||--o{ crias : "es_la_cria"
    reproducciones ||--o{ animales : "tiene_padre"